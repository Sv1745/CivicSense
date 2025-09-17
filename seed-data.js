import { supabase } from './lib/supabase';

// Seed function to populate the database with Indian Government data
export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // First, seed categories
    const categories = [
      { name: 'Infrastructure', description: 'Roads, bridges, buildings, and public works', color: '#F59E0B', icon: 'construction' },
      { name: 'Healthcare', description: 'Medical services, hospitals, and public health', color: '#10B981', icon: 'heart' },
      { name: 'Education', description: 'Schools, colleges, and educational services', color: '#3B82F6', icon: 'graduation-cap' },
      { name: 'Environment', description: 'Pollution control, sanitation, and environmental protection', color: '#059669', icon: 'leaf' },
      { name: 'Transportation', description: 'Public transport, traffic, and vehicle services', color: '#8B5CF6', icon: 'bus' },
      { name: 'Utilities', description: 'Water supply, electricity, and essential services', color: '#0EA5E9', icon: 'zap' },
      { name: 'Law & Order', description: 'Police services, security, and safety', color: '#EF4444', icon: 'shield' },
      { name: 'Civic Services', description: 'Municipal services, permits, and local governance', color: '#6B7280', icon: 'building' }
    ];

    console.log('📋 Inserting categories...');
    const { error: categoriesError } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'name' });

    if (categoriesError) {
      console.error('Error inserting categories:', categoriesError);
    } else {
      console.log('✅ Categories inserted successfully');
    }

    // Then, seed departments
    const departments = [
      // Central Government Ministries
      {
        name: 'Ministry of Home Affairs',
        description: 'Internal security, police coordination, disaster management',
        contact_email: 'mha@gov.in',
        contact_phone: '+91-11-23092445',
        jurisdiction: 'National',
        state: 'Delhi',
        city: 'New Delhi'
      },
      {
        name: 'Ministry of Health & Family Welfare',
        description: 'Public health policy, medical services, pharmaceuticals',
        contact_email: 'mohfw@gov.in',
        contact_phone: '+91-11-23061863',
        jurisdiction: 'National',
        state: 'Delhi',
        city: 'New Delhi'
      },
      {
        name: 'Ministry of Education',
        description: 'School education, higher education, literacy programs',
        contact_email: 'moe@gov.in',
        contact_phone: '+91-11-23382698',
        jurisdiction: 'National',
        state: 'Delhi',
        city: 'New Delhi'
      },
      {
        name: 'Ministry of Railways',
        description: 'Railway infrastructure, operations, safety',
        contact_email: 'railways@gov.in',
        contact_phone: '+91-11-23389595',
        jurisdiction: 'National',
        state: 'Delhi',
        city: 'New Delhi'
      },
      
      // State Level Departments
      {
        name: 'State Police Department',
        description: 'State law enforcement, crime prevention, public safety',
        contact_email: 'police@state.gov.in',
        contact_phone: '+91-100',
        jurisdiction: 'State',
        state: 'All States',
        city: 'State Capital'
      },
      {
        name: 'Public Works Department (PWD)',
        description: 'State infrastructure, building construction, maintenance',
        contact_email: 'pwd@state.gov.in',
        contact_phone: '+91-1070',
        jurisdiction: 'State',
        state: 'All States',
        city: 'State Capital'
      },
      {
        name: 'State Transport Corporation',
        description: 'Public bus services, transport permits, vehicle registration',
        contact_email: 'transport@state.gov.in',
        contact_phone: '+91-1073',
        jurisdiction: 'State',
        state: 'All States',
        city: 'State Capital'
      },
      {
        name: 'State Electricity Board',
        description: 'Power generation, transmission, distribution, billing',
        contact_email: 'electricity@state.gov.in',
        contact_phone: '+91-1912',
        jurisdiction: 'State',
        state: 'All States',
        city: 'State Capital'
      },
      
      // Municipal Bodies
      {
        name: 'Municipal Corporation',
        description: 'Urban local governance, civic amenities, property tax',
        contact_email: 'municipal@city.gov.in',
        contact_phone: '+91-1950',
        jurisdiction: 'City',
        state: 'All States',
        city: 'Major Cities'
      },
      {
        name: 'Municipal Council',
        description: 'Local town governance, basic civic services, sanitation',
        contact_email: 'council@town.gov.in',
        contact_phone: '+91-1951',
        jurisdiction: 'City',
        state: 'All States',
        city: 'Towns'
      },
      
      // Specialized Agencies
      {
        name: 'Pollution Control Board',
        description: 'Environmental monitoring, pollution control, clearances',
        contact_email: 'pcb@state.gov.in',
        contact_phone: '+91-1800',
        jurisdiction: 'State',
        state: 'All States',
        city: 'State Capital'
      },
      {
        name: 'Fire & Emergency Services',
        description: 'Fire safety, emergency response, disaster rescue',
        contact_email: 'fire@emergency.gov.in',
        contact_phone: '+91-101',
        jurisdiction: 'State',
        state: 'All States',
        city: 'All Cities'
      }
    ];

    console.log('🏛️ Inserting departments...');
    const { error: departmentsError } = await supabase
      .from('departments')
      .upsert(departments, { onConflict: 'name' });

    if (departmentsError) {
      console.error('Error inserting departments:', departmentsError);
    } else {
      console.log('✅ Departments inserted successfully');
    }

    console.log('🎉 Database seeding completed!');
    console.log('📊 You can now see departments in dropdowns and dashboard');

  } catch (error) {
    console.error('❌ Error during database seeding:', error);
  }
}

// Call this function to seed the database
if (typeof window !== 'undefined') {
  // Only run in browser
  console.log('🌱 Run seedDatabase() in the browser console to populate the database');
}