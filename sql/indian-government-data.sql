-- Insert comprehensive Indian Government Departments and Civic Bodies
INSERT INTO departments (name, description, contact_email, contact_phone, jurisdiction_type, jurisdiction_value, created_at, updated_at) VALUES

-- Central Government Ministries
('Ministry of Home Affairs', 'Internal security, police coordination, disaster management, and border security', 'mha@gov.in', '+91-11-23092445', 'national', 'India', NOW(), NOW()),
('Ministry of Health & Family Welfare', 'Public health policy, medical services, pharmaceuticals, and healthcare infrastructure', 'mohfw@gov.in', '+91-11-23061863', 'national', 'India', NOW(), NOW()),
('Ministry of Education', 'School education, higher education, literacy programs, and skill development', 'moe@gov.in', '+91-11-23382698', 'national', 'India', NOW(), NOW()),
('Ministry of Railways', 'Railway infrastructure, operations, safety, and passenger services', 'railways@gov.in', '+91-11-23389595', 'national', 'India', NOW(), NOW()),
('Ministry of Road Transport & Highways', 'National highways, road infrastructure, transport policy, and road safety', 'morth@gov.in', '+91-11-23717264', 'national', 'India', NOW(), NOW()),
('Ministry of Housing & Urban Affairs', 'Urban planning, housing schemes, smart cities, and urban development', 'mohua@gov.in', '+91-11-23061829', 'national', 'India', NOW(), NOW()),
('Ministry of Rural Development', 'Rural employment, poverty alleviation, rural infrastructure, and village development', 'mrd@gov.in', '+91-11-23384899', 'national', 'India', NOW(), NOW()),
('Ministry of Environment, Forest & Climate Change', 'Environmental protection, forest conservation, climate policy, and pollution control', 'moef@gov.in', '+91-11-24695334', 'national', 'India', NOW(), NOW()),
('Ministry of Power', 'Power generation, transmission, distribution, and renewable energy', 'power@gov.in', '+91-11-23710271', 'national', 'India', NOW(), NOW()),
('Ministry of Water Resources', 'Water resource management, irrigation, flood control, and river development', 'mowr@gov.in', '+91-11-23384004', 'national', 'India', NOW(), NOW()),

-- State Level Departments (Generic - can be customized per state)
('State Police Department', 'State law enforcement, crime prevention, traffic management, and public order', 'police@state.gov.in', '+91-11-100', 'state', 'All States', NOW(), NOW()),
('Public Works Department (PWD)', 'State infrastructure development, building construction, road maintenance, and public facilities', 'pwd@state.gov.in', '+91-11-1070', 'state', 'All States', NOW(), NOW()),
('State Transport Corporation', 'Public bus services, transport permits, vehicle registration, and traffic regulation', 'transport@state.gov.in', '+91-11-1073', 'state', 'All States', NOW(), NOW()),
('State Electricity Board', 'Power generation, transmission, distribution, billing, and electrical safety', 'electricity@state.gov.in', '+91-11-1912', 'state', 'All States', NOW(), NOW()),
('Water Supply & Sewerage Board', 'Water supply systems, sewage treatment, sanitation, and water quality management', 'water@state.gov.in', '+91-11-1916', 'state', 'All States', NOW(), NOW()),
('State Health Department', 'State hospitals, primary healthcare, immunization, and medical services', 'health@state.gov.in', '+91-11-108', 'state', 'All States', NOW(), NOW()),
('State Education Department', 'State schools, teacher training, educational infrastructure, and academic programs', 'education@state.gov.in', '+91-11-1098', 'state', 'All States', NOW(), NOW()),
('Forest Department', 'Forest conservation, wildlife protection, environmental preservation, and eco-tourism', 'forest@state.gov.in', '+91-11-1926', 'state', 'All States', NOW(), NOW()),

-- Municipal and Local Bodies
('Municipal Corporation', 'Urban local governance, civic amenities, property tax, and municipal services', 'municipal@city.gov.in', '+91-11-1950', 'city', 'Major Cities', NOW(), NOW()),
('Municipal Council', 'Local town governance, basic civic services, sanitation, and local development', 'council@town.gov.in', '+91-11-1951', 'city', 'Towns', NOW(), NOW()),
('Gram Panchayat', 'Village governance, rural development, water supply, and local administration', 'panchayat@village.gov.in', '+91-11-1077', 'village', 'Villages', NOW(), NOW()),
('District Collector Office', 'District administration, revenue collection, disaster management, and law enforcement coordination', 'collector@district.gov.in', '+91-11-1077', 'district', 'All Districts', NOW(), NOW()),
('Tehsildar Office', 'Sub-district administration, land records, revenue collection, and civil services', 'tehsildar@tehsil.gov.in', '+91-11-1077', 'tehsil', 'All Tehsils', NOW(), NOW()),

-- Specialized Government Agencies
('Central Pollution Control Board', 'National environmental monitoring, pollution control standards, and environmental compliance', 'cpcb@gov.in', '+91-11-24305792', 'national', 'India', NOW(), NOW()),
('State Pollution Control Board', 'State-level pollution monitoring, environmental clearances, and pollution control measures', 'spcb@state.gov.in', '+91-11-1800', 'state', 'All States', NOW(), NOW()),
('Fire & Emergency Services', 'Fire safety, emergency response, disaster rescue, and fire prevention', 'fire@emergency.gov.in', '+91-101', 'state', 'All States', NOW(), NOW()),
('Traffic Police Department', 'Traffic regulation, road safety enforcement, vehicle checking, and traffic management', 'traffic@police.gov.in', '+91-11-103', 'state', 'All States', NOW(), NOW()),
('Food Safety & Standards Authority', 'Food safety regulation, quality control, licensing, and food standards enforcement', 'fssai@gov.in', '+91-11-23220994', 'national', 'India', NOW(), NOW()),
('Labour Department', 'Worker welfare, employment services, industrial relations, and labour law enforcement', 'labour@state.gov.in', '+91-11-1800', 'state', 'All States', NOW(), NOW()),

-- Utility Services
('Gas Distribution Corporation', 'LPG distribution, pipeline gas supply, and gas safety services', 'gas@utility.gov.in', '+91-1906', 'state', 'All States', NOW(), NOW()),
('Telecom Department', 'Telecommunications infrastructure, internet services, and digital connectivity', 'telecom@gov.in', '+91-11-23037307', 'national', 'India', NOW(), NOW()),
('Postal Services', 'Mail delivery, postal savings, financial services, and communication services', 'postal@indiapost.gov.in', '+91-11-23096144', 'national', 'India', NOW(), NOW()),

-- Revenue and Finance
('Income Tax Department', 'Income tax collection, tax compliance, and taxpayer services', 'incometax@gov.in', '+91-11-23092600', 'national', 'India', NOW(), NOW()),
('Sales Tax Department', 'State sales tax, VAT, GST coordination, and commercial tax administration', 'salestax@state.gov.in', '+91-11-1800', 'state', 'All States', NOW(), NOW()),
('Registration Department', 'Property registration, document registration, and stamp duty collection', 'registration@state.gov.in', '+91-11-1800', 'state', 'All States', NOW(), NOW()),

-- Social Welfare and Development
('Social Welfare Department', 'Social security schemes, welfare programs, disability services, and community development', 'socialwelfare@state.gov.in', '+91-11-1800', 'state', 'All States', NOW(), NOW()),
('Women & Child Development', 'Women empowerment, child welfare, nutrition programs, and gender equality initiatives', 'wcd@gov.in', '+91-11-23383802', 'national', 'India', NOW(), NOW()),
('Tribal Affairs Department', 'Tribal development, indigenous rights, forest rights, and tribal welfare schemes', 'tribal@gov.in', '+91-11-24626875', 'national', 'India', NOW(), NOW()),

-- Agriculture and Cooperation
('Agriculture Department', 'Agricultural development, crop insurance, farmer welfare, and agricultural extension services', 'agriculture@state.gov.in', '+91-1551', 'state', 'All States', NOW(), NOW()),
('Cooperative Department', 'Cooperative societies, rural credit, agricultural cooperatives, and rural banking', 'cooperative@state.gov.in', '+91-11-1800', 'state', 'All States', NOW(), NOW()),
('Food Corporation of India', 'Food grain procurement, storage, distribution, and public food distribution system', 'fci@gov.in', '+91-11-24368749', 'national', 'India', NOW(), NOW()),

-- Tourism and Culture
('Tourism Department', 'Tourism promotion, heritage conservation, tourist facilities, and cultural tourism', 'tourism@state.gov.in', '+91-1363', 'state', 'All States', NOW(), NOW()),
('Archaeological Survey of India', 'Heritage monument conservation, archaeological research, and cultural preservation', 'asi@gov.in', '+91-11-23012617', 'national', 'India', NOW(), NOW())

ON CONFLICT (name) DO NOTHING;

-- Insert comprehensive categories for civic issues
INSERT INTO categories (name, description, color, icon, created_at, updated_at) VALUES

-- Infrastructure and Public Works
('Road Infrastructure', 'Roads, bridges, footpaths, traffic signals, and transportation infrastructure', '#3B82F6', 'construction', NOW(), NOW()),
('Water Supply & Drainage', 'Water supply issues, drainage problems, sewerage, and water quality concerns', '#06B6D4', 'droplets', NOW(), NOW()),
('Electricity & Power', 'Power outages, electrical hazards, street lighting, and energy infrastructure', '#F59E0B', 'zap', NOW(), NOW()),
('Waste Management', 'Garbage collection, waste disposal, recycling, and sanitation services', '#10B981', 'trash-2', NOW(), NOW()),
('Public Transportation', 'Bus services, metro, auto-rickshaws, and public transport infrastructure', '#8B5CF6', 'bus', NOW(), NOW()),

-- Public Safety and Security
('Law & Order', 'Crime, police services, public safety, and security concerns', '#EF4444', 'shield', NOW(), NOW()),
('Traffic Management', 'Traffic violations, parking issues, road safety, and traffic infrastructure', '#F97316', 'traffic-cone', NOW(), NOW()),
('Fire Safety', 'Fire hazards, emergency services, fire safety equipment, and prevention measures', '#DC2626', 'flame', NOW(), NOW()),
('Disaster Management', 'Natural disasters, emergency preparedness, relief services, and disaster response', '#B91C1C', 'alert-triangle', NOW(), NOW()),

-- Health and Environment
('Healthcare Services', 'Hospitals, clinics, medical services, healthcare accessibility, and public health', '#059669', 'heart', NOW(), NOW()),
('Environmental Issues', 'Pollution, air quality, noise pollution, and environmental conservation', '#16A34A', 'leaf', NOW(), NOW()),
('Food Safety', 'Food quality, hygiene in restaurants, food adulteration, and food safety standards', '#CA8A04', 'utensils', NOW(), NOW()),
('Animal Welfare', 'Stray animals, animal cruelty, veterinary services, and animal control', '#7C3AED', 'heart', NOW(), NOW()),

-- Education and Social Services
('Education', 'Schools, colleges, educational facilities, teacher issues, and academic infrastructure', '#2563EB', 'graduation-cap', NOW(), NOW()),
('Social Welfare', 'Social security, disability services, elderly care, and welfare programs', '#DB2777', 'users', NOW(), NOW()),
('Women & Child Safety', 'Women safety, child welfare, domestic violence, and protection services', '#EC4899', 'shield-check', NOW(), NOW()),

-- Civic Amenities and Public Spaces
('Public Parks & Recreation', 'Parks, playgrounds, recreational facilities, and public spaces maintenance', '#22C55E', 'tree-pine', NOW(), NOW()),
('Public Toilets & Sanitation', 'Public toilet facilities, cleanliness, and sanitation infrastructure', '#0EA5E9', 'home', NOW(), NOW()),
('Street Vendors & Markets', 'Market regulation, vendor licensing, street food safety, and commercial spaces', '#F59E0B', 'store', NOW(), NOW()),

-- Government Services and Administration
('Government Services', 'Bureaucratic issues, document processing, public service delivery, and administrative concerns', '#6B7280', 'file-text', NOW(), NOW()),
('Corruption & Transparency', 'Corruption complaints, transparency issues, and governance concerns', '#991B1B', 'eye', NOW(), NOW()),
('Digital Services', 'E-governance issues, digital service problems, and online service accessibility', '#3B82F6', 'smartphone', NOW(), NOW()),

-- Utilities and Communications
('Telecommunications', 'Internet connectivity, mobile network issues, and communication infrastructure', '#8B5CF6', 'phone', NOW(), NOW()),
('Banking & Finance', 'Banking services, ATM issues, financial services, and monetary concerns', '#059669', 'credit-card', NOW(), NOW()),

-- Special Categories
('Tourism & Heritage', 'Tourist facilities, heritage conservation, cultural sites, and tourism infrastructure', '#D97706', 'camera', NOW(), NOW()),
('Agriculture & Rural', 'Agricultural issues, rural development, farming concerns, and rural infrastructure', '#65A30D', 'tractor', NOW(), NOW()),
('Consumer Rights', 'Consumer complaints, product quality, service issues, and consumer protection', '#7C2D12', 'shopping-cart', NOW(), NOW()),
('Other Issues', 'Miscellaneous civic issues not covered in other categories', '#6B7280', 'help-circle', NOW(), NOW())

ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_departments_jurisdiction ON departments(jurisdiction_type, jurisdiction_value);
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_issues_department ON issues(department_id);
CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);