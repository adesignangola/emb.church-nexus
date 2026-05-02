-- Set Ruben Bitumba as ADMIN and PASTOR
UPDATE profiles 
SET roles = '{"ADMIN", "PASTOR"}'
WHERE email = 'rubenbitumba@embchurch.com';
