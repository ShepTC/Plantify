import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function usePlantCollection() {
  const client = useQueryClient();
  const pending = useRef(new Set());
  const [adding, setAdding] = useState(null);
  const [error, setError] = useState('');
  const query = useQuery({
    queryKey: ['plant-collection'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const [plants, garden] = await Promise.all([
        base44.entities.Plant.list('name', 2000),
        base44.entities.UserPlant.filter({ created_by_id: user.id }, '-created_date', 2000),
      ]);
      return { user, plants, garden };
    },
  });
  const addPlant = async (plant) => {
    if (pending.current.has(plant.id) || query.data?.garden.some(p => p.plant_id === plant.id)) return;
    pending.current.add(plant.id); setAdding(plant.id); setError('');
    try {
      const record = await base44.entities.UserPlant.create({ plant_id: plant.id, plant_name: plant.name, status: 'planned', remind_me: false, ...(plant.method ? { planting_method: plant.method } : {}) });
      client.setQueryData(['plant-collection'], data => ({ ...data, garden: [...data.garden, record] }));
    } catch (e) { setError(e.message || 'Could not add this plant. Please try again.'); }
    finally { pending.current.delete(plant.id); setAdding(null); }
  };
  return { ...query, ...(query.data || { user: null, plants: [], garden: [] }), addPlant, adding, actionError: error };
}