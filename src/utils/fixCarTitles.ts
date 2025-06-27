
import { supabase } from '@/integrations/supabase/client';
import { generateCarTitle, isGenericTitle } from './carTitleGenerator';
import { toast } from 'sonner';

/**
 * Fixes all cars in the database that have generic titles
 * by generating proper titles from their make, model, and year
 */
export async function fixAllCarTitles(): Promise<{
  success: boolean;
  updatedCount: number;
  error?: string;
}> {
  try {
    console.log('Starting car title fix operation...');
    
    // First, get all cars with generic titles or missing data
    const { data: cars, error: fetchError } = await supabase
      .from('cars')
      .select('id, title, make, model, year')
      .or('title.is.null,title.eq.Car Listing,title.eq.Unknown,title.eq.Untitled');
    
    if (fetchError) {
      console.error('Error fetching cars:', fetchError);
      return { success: false, updatedCount: 0, error: fetchError.message };
    }
    
    if (!cars || cars.length === 0) {
      console.log('No cars need title updates');
      return { success: true, updatedCount: 0 };
    }
    
    console.log(`Found ${cars.length} cars that need title updates`);
    
    // Update each car with a proper title
    let updatedCount = 0;
    const errors: string[] = [];
    
    for (const car of cars) {
      try {
        if (!car.make || !car.model || !car.year) {
          console.warn(`Skipping car ${car.id} - missing make, model, or year`);
          continue;
        }
        
        const newTitle = generateCarTitle(car.make, car.model, car.year);
        
        const { error: updateError } = await supabase
          .from('cars')
          .update({ title: newTitle })
          .eq('id', car.id);
        
        if (updateError) {
          console.error(`Error updating car ${car.id}:`, updateError);
          errors.push(`Car ${car.id}: ${updateError.message}`);
        } else {
          console.log(`Updated car ${car.id}: "${car.title}" -> "${newTitle}"`);
          updatedCount++;
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error processing car ${car.id}:`, errorMsg);
        errors.push(`Car ${car.id}: ${errorMsg}`);
      }
    }
    
    console.log(`Car title fix completed. Updated ${updatedCount} cars.`);
    
    if (errors.length > 0) {
      console.warn('Some cars could not be updated:', errors);
      return {
        success: false,
        updatedCount,
        error: `Updated ${updatedCount} cars, but ${errors.length} failed: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...' : ''}`
      };
    }
    
    return { success: true, updatedCount };
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Fatal error in fixAllCarTitles:', errorMsg);
    return { success: false, updatedCount: 0, error: errorMsg };
  }
}

/**
 * Runs the car title fix and shows toast notifications
 */
export async function runCarTitleFix(): Promise<void> {
  toast.info('Fixing car titles...', { description: 'Updating cars with generic titles' });
  
  const result = await fixAllCarTitles();
  
  if (result.success) {
    if (result.updatedCount > 0) {
      toast.success(`Fixed ${result.updatedCount} car titles`, {
        description: 'All cars now have proper names'
      });
    } else {
      toast.info('No car titles needed fixing', {
        description: 'All cars already have proper titles'
      });
    }
  } else {
    toast.error('Failed to fix car titles', {
      description: result.error || 'Unknown error occurred'
    });
  }
}
