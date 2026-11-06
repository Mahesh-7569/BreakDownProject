import { API_BASE_URL } from '../config/apiConfig';

export type EolParam = {
  id: number;            // required now to match table
  description: string;
  detailProcess: string;
  active: boolean;
};

// Get all EOL params
export async function getEolParams(): Promise<EolParam[]> {
  const res = await fetch(`${API_BASE_URL}/EolParam`);
  if (!res.ok) throw new Error('Failed to fetch EOL parameters');
  return res.json();
}

// Get one by id
export async function getEolParamById(id: number): Promise<EolParam> {
  const res = await fetch(`${API_BASE_URL}/EolParam/${id}`);
  if (!res.ok) throw new Error("Failed to fetch EOL param");
  const data = await res.json();
  return {
    id: data.id,
    description: data.description,
    detailProcess: data.detailProcess,
    active: data.isActive, // backend field
  };
}


// Add new EOL param
export async function addEolParam(param: {
  description: string;
  detailProcess: string;
  active: boolean;
}) {
  const payload = {
    description: param.description,
    detailProcess: param.detailProcess,
    isActive: param.active, // ✅ IMPORTANT
  };

  const res = await fetch(`${API_BASE_URL}/EolParam`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to add EOL parameter");
  return res.json();
}

// Update existing EOL param
export async function updateEolParam(id: number, data: EolParam): Promise<EolParam> {
  const payload = {
    id: data.id,
    description: data.description,
    detailProcess: data.detailProcess,
    isActive: data.active, // important!
  };

  const res = await fetch(`${API_BASE_URL}/EolParam/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Failed to update EOL param');
  return res.json();
}
 
// Delete EOL param
export async function deleteEolParam(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/EolParam/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete EOL parameter');
}
