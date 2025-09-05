-- Create notifications table with proper schema and RLS
CREATE TYPE public.notification_type AS ENUM ('appointment', 'case', 'document', 'message', 'system');

CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type notification_type NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  metadata jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to send notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type notification_type,
  p_title text,
  p_body text,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, metadata)
  VALUES (p_user_id, p_type, p_title, p_body, p_metadata)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Trigger function for appointment notifications
CREATE OR REPLACE FUNCTION public.notify_appointment_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- On appointment creation
  IF TG_OP = 'INSERT' THEN
    PERFORM public.create_notification(
      NEW.client_id,
      'appointment'::notification_type,
      'موعد جديد',
      'تم حجز موعد جديد في ' || NEW.scheduled_date || ' الساعة ' || NEW.scheduled_time,
      jsonb_build_object('appointment_id', NEW.id, 'action', 'created')
    );
    
    -- Notify lawyer if assigned
    IF NEW.lawyer_id IS NOT NULL THEN
      PERFORM public.create_notification(
        NEW.lawyer_id,
        'appointment'::notification_type,
        'موعد جديد مُسند إليك',
        'تم تكليفك بموعد جديد مع عميل في ' || NEW.scheduled_date,
        jsonb_build_object('appointment_id', NEW.id, 'action', 'assigned')
      );
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- On appointment update
  IF TG_OP = 'UPDATE' THEN
    -- Check for status changes
    IF OLD.status != NEW.status THEN
      PERFORM public.create_notification(
        NEW.client_id,
        'appointment'::notification_type,
        'تحديث حالة الموعد',
        'تم تحديث حالة الموعد إلى: ' || 
        CASE NEW.status
          WHEN 'confirmed' THEN 'مؤكد'
          WHEN 'cancelled' THEN 'ملغي'
          WHEN 'completed' THEN 'مكتمل'
          ELSE NEW.status::text
        END,
        jsonb_build_object('appointment_id', NEW.id, 'action', 'status_changed', 'old_status', OLD.status, 'new_status', NEW.status)
      );
    END IF;
    
    -- Check for lawyer assignment changes
    IF OLD.lawyer_id IS DISTINCT FROM NEW.lawyer_id THEN
      IF NEW.lawyer_id IS NOT NULL THEN
        PERFORM public.create_notification(
          NEW.lawyer_id,
          'appointment'::notification_type,
          'موعد جديد مُسند إليك',
          'تم تكليفك بموعد في ' || NEW.scheduled_date,
          jsonb_build_object('appointment_id', NEW.id, 'action', 'assigned')
        );
      END IF;
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Trigger function for case notifications
CREATE OR REPLACE FUNCTION public.notify_case_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- On case creation
  IF TG_OP = 'INSERT' THEN
    PERFORM public.create_notification(
      NEW.client_id,
      'case'::notification_type,
      'قضية جديدة',
      'تم إنشاء قضية جديدة: ' || NEW.title,
      jsonb_build_object('case_id', NEW.id, 'action', 'created')
    );
    
    RETURN NEW;
  END IF;
  
  -- On case update
  IF TG_OP = 'UPDATE' THEN
    -- Check for status changes
    IF OLD.status != NEW.status THEN
      PERFORM public.create_notification(
        NEW.client_id,
        'case'::notification_type,
        'تحديث حالة القضية',
        'تم تحديث حالة القضية "' || NEW.title || '" إلى: ' || 
        CASE NEW.status
          WHEN 'initial' THEN 'مبدئية'
          WHEN 'under_review' THEN 'قيد المراجعة'
          WHEN 'active' THEN 'نشطة'
          WHEN 'in_court' THEN 'في المحكمة'
          WHEN 'settled' THEN 'مسوية'
          WHEN 'closed' THEN 'مغلقة'
          ELSE NEW.status::text
        END,
        jsonb_build_object('case_id', NEW.id, 'action', 'status_changed', 'old_status', OLD.status, 'new_status', NEW.status)
      );
    END IF;
    
    -- Check for lawyer assignment
    IF OLD.assigned_lawyer_id IS DISTINCT FROM NEW.assigned_lawyer_id AND NEW.assigned_lawyer_id IS NOT NULL THEN
      PERFORM public.create_notification(
        NEW.assigned_lawyer_id,
        'case'::notification_type,
        'قضية جديدة مُسندة إليك',
        'تم تكليفك بقضية: ' || NEW.title,
        jsonb_build_object('case_id', NEW.id, 'action', 'assigned')
      );
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Trigger function for document notifications
CREATE OR REPLACE FUNCTION public.notify_document_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- On document creation
  IF TG_OP = 'INSERT' THEN
    PERFORM public.create_notification(
      NEW.uploaded_by,
      'document'::notification_type,
      'تم رفع مستند جديد',
      'تم رفع مستند "' || NEW.file_name || '" بنجاح وسيتم مراجعته قريباً',
      jsonb_build_object('document_id', NEW.id, 'action', 'uploaded')
    );
    
    RETURN NEW;
  END IF;
  
  -- On document status update
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      PERFORM public.create_notification(
        NEW.uploaded_by,
        'document'::notification_type,
        'تحديث حالة المستند',
        'تم تحديث حالة مستند "' || NEW.file_name || '" إلى: ' || 
        CASE NEW.status
          WHEN 'approved' THEN 'مقبول'
          WHEN 'rejected' THEN 'مرفوض'
          WHEN 'pending' THEN 'قيد المراجعة'
          ELSE NEW.status::text
        END,
        jsonb_build_object('document_id', NEW.id, 'action', 'status_changed', 'old_status', OLD.status, 'new_status', NEW.status)
      );
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Trigger function for message notifications
CREATE OR REPLACE FUNCTION public.notify_message_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- On message creation
  IF TG_OP = 'INSERT' THEN
    PERFORM public.create_notification(
      NEW.sender_id,
      'message'::notification_type,
      'تم إرسال رسالة جديدة',
      'تم إرسال رسالة بموضوع: ' || NEW.subject,
      jsonb_build_object('message_id', NEW.id, 'action', 'sent')
    );
    
    RETURN NEW;
  END IF;
  
  -- On message response
  IF TG_OP = 'UPDATE' THEN
    IF OLD.response IS NULL AND NEW.response IS NOT NULL THEN
      PERFORM public.create_notification(
        NEW.sender_id,
        'message'::notification_type,
        'تم الرد على رسالتك',
        'تم الرد على رسالة "' || NEW.subject || '"',
        jsonb_build_object('message_id', NEW.id, 'action', 'responded')
      );
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create triggers
CREATE TRIGGER appointments_notification_trigger
  AFTER INSERT OR UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.notify_appointment_changes();

CREATE TRIGGER cases_notification_trigger
  AFTER INSERT OR UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.notify_case_changes();

CREATE TRIGGER documents_notification_trigger
  AFTER INSERT OR UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.notify_document_changes();

CREATE TRIGGER messages_notification_trigger
  AFTER INSERT OR UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_message_changes();