UPDATE whatsapp_message_log
SET status = 'sent'
WHERE status = 'queued' AND error_message IS NULL;