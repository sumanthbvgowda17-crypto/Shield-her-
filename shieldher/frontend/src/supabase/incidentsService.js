import { supabase } from './client';

/**
 * Fetch all incidents from Supabase incidents table
 */
export async function fetchIncidents() {
  try {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase Incidents] Fetch warning:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('[Supabase Incidents] Fetch error:', err);
    return [];
  }
}

/**
 * Save an SOS alert or user report into the Supabase incidents table.
 * Enforces RLS by attaching authenticated user ID if available.
 */
export async function saveIncident({
  title = 'EMERGENCY SOS',
  description = 'Emergency SOS triggered',
  latitude = 12.2958,
  longitude = 76.6394,
  status = 'active',
  user_id = null
}) {
  try {
    // 1. Get current authenticated user session if not explicitly provided
    let authUserId = user_id;
    if (!authUserId) {
      const { data: { session } } = await supabase.auth.getSession();
      authUserId = session?.user?.id || null;
    }

    const payload = {
      title,
      description,
      latitude: Number(latitude),
      longitude: Number(longitude),
      status
    };

    // Include user_id if authenticated user is present
    if (authUserId) {
      payload.user_id = authUserId;
    }

    console.log('[Supabase Incidents] Inserting incident:', payload);

    const { data, error } = await supabase
      .from('incidents')
      .insert([payload])
      .select();

    if (error) {
      console.warn('[Supabase Incidents] Insert error (RLS or column):', error.message);
      return { success: false, error: error.message };
    }

    console.log('[Supabase Incidents] Successfully saved incident:', data);
    return { success: true, data: data?.[0] };
  } catch (err) {
    console.error('[Supabase Incidents] Exception saving incident:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Update an incident status (e.g. mark as resolved)
 */
export async function updateIncidentStatus(incidentId, status = 'resolved') {
  try {
    const { data, error } = await supabase
      .from('incidents')
      .update({ status })
      .eq('id', incidentId)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('[Supabase Incidents] Error updating status:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Real-time subscription to incidents table changes
 */
export function subscribeToIncidents(callback) {
  try {
    const channel = supabase
      .channel('incidents-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'incidents' },
        (payload) => {
          console.log('[Supabase Incidents] Real-time change received:', payload);
          callback(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('[Supabase Incidents] Realtime subscription fallback:', err);
    return () => {};
  }
}

