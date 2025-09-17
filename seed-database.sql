-- Quick seed script for Indian Government Departments and Categories
-- Run this in your Supabase SQL editor

-- First, let's insert some basic categories
INSERT INTO categories (name, description, color, icon) VALUES
('Infrastructure', 'Roads, bridges, buildings, and public works', '#F59E0B', 'construction'),
('Healthcare', 'Medical services, hospitals, and public health', '#10B981', 'heart'),
('Education', 'Schools, colleges, and educational services', '#3B82F6', 'graduation-cap'),
('Environment', 'Pollution control, sanitation, and environmental protection', '#059669', 'leaf'),
('Transportation', 'Public transport, traffic, and vehicle services', '#8B5CF6', 'bus'),
('Utilities', 'Water supply, electricity, and essential services', '#0EA5E9', 'zap'),
('Law & Order', 'Police services, security, and safety', '#EF4444', 'shield'),
('Civic Services', 'Municipal services, permits, and local governance', '#6B7280', 'building')
ON CONFLICT (name) DO NOTHING;

-- Now, let's insert Indian Government Departments
INSERT INTO departments (name, description, contact_email, contact_phone, jurisdiction, state, city) VALUES

-- Central Government Ministries
('Ministry of Home Affairs', 'Internal security, police coordination, disaster management', 'mha@gov.in', '+91-11-23092445', 'National', 'Delhi', 'New Delhi'),
('Ministry of Health & Family Welfare', 'Public health policy, medical services, pharmaceuticals', 'mohfw@gov.in', '+91-11-23061863', 'National', 'Delhi', 'New Delhi'),
('Ministry of Education', 'School education, higher education, literacy programs', 'moe@gov.in', '+91-11-23382698', 'National', 'Delhi', 'New Delhi'),
('Ministry of Railways', 'Railway infrastructure, operations, safety', 'railways@gov.in', '+91-11-23389595', 'National', 'Delhi', 'New Delhi'),
('Ministry of Road Transport & Highways', 'National highways, road infrastructure, transport policy', 'morth@gov.in', '+91-11-23717264', 'National', 'Delhi', 'New Delhi'),

-- State Level Departments
('State Police Department', 'State law enforcement, crime prevention, public safety', 'police@state.gov.in', '+91-100', 'State', 'All States', 'State Capital'),
('Public Works Department (PWD)', 'State infrastructure, building construction, maintenance', 'pwd@state.gov.in', '+91-1070', 'State', 'All States', 'State Capital'),
('State Transport Corporation', 'Public bus services, transport permits, vehicle registration', 'transport@state.gov.in', '+91-1073', 'State', 'All States', 'State Capital'),
('State Electricity Board', 'Power generation, transmission, distribution, billing', 'electricity@state.gov.in', '+91-1912', 'State', 'All States', 'State Capital'),
('Water Supply & Sewerage Board', 'Water supply systems, sewage treatment, sanitation', 'water@state.gov.in', '+91-1916', 'State', 'All States', 'State Capital'),

-- Municipal Bodies
('Municipal Corporation', 'Urban local governance, civic amenities, property tax', 'municipal@city.gov.in', '+91-1950', 'City', 'All States', 'Major Cities'),
('Municipal Council', 'Local town governance, basic civic services, sanitation', 'council@town.gov.in', '+91-1951', 'City', 'All States', 'Towns'),
('Gram Panchayat', 'Village governance, rural development, water supply', 'panchayat@village.gov.in', '+91-1077', 'Village', 'All States', 'Villages'),

-- Specialized Agencies
('Pollution Control Board', 'Environmental monitoring, pollution control, clearances', 'pcb@state.gov.in', '+91-1800', 'State', 'All States', 'State Capital'),
('Fire & Emergency Services', 'Fire safety, emergency response, disaster rescue', 'fire@emergency.gov.in', '+91-101', 'State', 'All States', 'All Cities'),
('Traffic Police Department', 'Traffic regulation, road safety enforcement, vehicle checking', 'traffic@police.gov.in', '+91-103', 'City', 'All States', 'All Cities')

ON CONFLICT (name) DO NOTHING;

-- Let's also create some sample issues to test the dashboard
INSERT INTO issues (title, description, category_id, department_id, user_id, priority, status, latitude, longitude) 
SELECT 
    CASE 
        WHEN random() < 0.3 THEN 'Road repair needed on Main Street'
        WHEN random() < 0.6 THEN 'Water supply issue in residential area'
        ELSE 'Street light not working'
    END as title,
    CASE 
        WHEN random() < 0.3 THEN 'Multiple potholes causing traffic disruption and safety hazards'
        WHEN random() < 0.6 THEN 'No water supply for 3 days, affecting 50+ families'
        ELSE 'Street light has been non-functional for over a week'
    END as description,
    (SELECT id FROM categories ORDER BY random() LIMIT 1) as category_id,
    (SELECT id FROM departments ORDER BY random() LIMIT 1) as department_id,
    (SELECT id FROM profiles LIMIT 1) as user_id,
    CASE 
        WHEN random() < 0.2 THEN 'high'
        WHEN random() < 0.6 THEN 'medium'
        ELSE 'low'
    END as priority,
    CASE 
        WHEN random() < 0.3 THEN 'resolved'
        WHEN random() < 0.6 THEN 'in_progress'
        ELSE 'submitted'
    END as status,
    28.6139 + (random() * 0.1) as latitude,
    77.2090 + (random() * 0.1) as longitude
FROM generate_series(1, 20);

-- Update statistics
SELECT 'Database seeded successfully with Indian Government departments and sample data!' as result;