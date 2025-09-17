"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function DatabaseSeeder() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const seedDatabase = async () => {
    setIsSeeding(true);
    setError(null);
    setSeedResult(null);

    try {
      // Seed categories first
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

      const { error: categoriesError } = await supabase
        .from('categories')
        .upsert(categories, { onConflict: 'name' });

      if (categoriesError) throw categoriesError;

      // Seed departments
      const departments = [
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
          name: 'Municipal Corporation',
          description: 'Urban local governance, civic amenities, property tax',
          contact_email: 'municipal@city.gov.in',
          contact_phone: '+91-1950',
          jurisdiction: 'City',
          state: 'All States',
          city: 'Major Cities'
        },
        {
          name: 'Pollution Control Board',
          description: 'Environmental monitoring, pollution control, clearances',
          contact_email: 'pcb@state.gov.in',
          contact_phone: '+91-1800',
          jurisdiction: 'State',
          state: 'All States',
          city: 'State Capital'
        }
      ];

      const { error: departmentsError } = await supabase
        .from('departments')
        .upsert(departments, { onConflict: 'name' });

      if (departmentsError) throw departmentsError;

      setSeedResult('✅ Database seeded successfully! Departments and categories are now available.');

    } catch (err: any) {
      setError(`❌ Error seeding database: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Database Seeder
        </CardTitle>
        <p className="text-sm text-gray-600">
          Populate your database with Indian Government departments and categories
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4">
          <Button 
            onClick={seedDatabase} 
            disabled={isSeeding}
            className="w-full"
          >
            {isSeeding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSeeding ? 'Seeding Database...' : 'Seed Database with Indian Gov Data'}
          </Button>

          {seedResult && (
            <Badge variant="default" className="bg-green-100 text-green-800 p-3 text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              {seedResult}
            </Badge>
          )}

          {error && (
            <Badge variant="destructive" className="p-3 text-sm">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {error}
            </Badge>
          )}

          <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">This will add:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>8 Issue Categories (Infrastructure, Healthcare, Education, etc.)</li>
              <li>6 Government Departments (Ministries, State Depts, Municipal Bodies)</li>
              <li>All with proper Indian government contact details</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}