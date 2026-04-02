import 'server-only'

import { getSupabaseAdminClient } from '@/lib/supabase-admin'

export type GridSweepStatus = 'running' | 'completed' | 'partial' | 'failed'
export type GridSweepCellStatus = 'pending' | 'success' | 'failed'

export type GridSweepCellItem = {
  id: string
  cellIndex: number
  status: GridSweepCellStatus
  bbox: {
    south: number
    west: number
    north: number
    east: number
  }
  fetchedCount: number
  preparedCount: number
  errorMessage: string | null
  completedAt: string | null
}

export type GridSweepItem = {
  id: string
  regionName: string
  presetName: string | null
  status: GridSweepStatus
  originLat: number
  originLng: number
  cellSizeMeters: number
  totalCells: number
  processedCells: number
  successfulCells: number
  failedCells: number
  bbox: {
    south: number
    west: number
    north: number
    east: number
  }
  startedAt: string
  completedAt: string | null
  cells: GridSweepCellItem[]
}

type GridSweepRow = {
  id: string
  region_name: string
  preset_name: string | null
  status: GridSweepStatus
  origin_lat: number
  origin_lng: number
  cell_size_meters: number
  total_cells: number
  processed_cells: number
  successful_cells: number
  failed_cells: number
  bbox_south: number
  bbox_west: number
  bbox_north: number
  bbox_east: number
  started_at: string
  completed_at: string | null
}

type GridSweepCellRow = {
  id: string
  sweep_id: string
  cell_index: number
  status: GridSweepCellStatus
  south: number
  west: number
  north: number
  east: number
  fetched_count: number
  prepared_count: number
  error_message: string | null
  completed_at: string | null
}

export async function fetchGridSweeps(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  limit: number,
): Promise<GridSweepItem[]> {
  const { data, error } = await client
    .from('grid_sweeps')
    .select(
      `
        id,
        region_name,
        preset_name,
        status,
        origin_lat,
        origin_lng,
        cell_size_meters,
        total_cells,
        processed_cells,
        successful_cells,
        failed_cells,
        bbox_south,
        bbox_west,
        bbox_north,
        bbox_east,
        started_at,
        completed_at
      `,
    )
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error('Grid sweep kayıtları okunamadı.')
  }

  return loadSweepCells(client, (data ?? []) as GridSweepRow[])
}

async function loadSweepCells(
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  sweeps: GridSweepRow[],
): Promise<GridSweepItem[]> {
  return Promise.all(
    sweeps.map(async (sweep) => {
      const { data, error } = await client
        .from('grid_sweep_cells')
        .select(
          `
            id,
            sweep_id,
            cell_index,
            status,
            south,
            west,
            north,
            east,
            fetched_count,
            prepared_count,
            error_message,
            completed_at
          `,
        )
        .eq('sweep_id', sweep.id)
        .order('cell_index', { ascending: false })
        .limit(8)

      if (error) {
        throw new Error('Grid hucreleri okunamadi.')
      }

      return mapGridSweepRow(sweep, ((data ?? []) as GridSweepCellRow[]).reverse())
    }),
  )
}

function mapGridSweepRow(row: GridSweepRow, cells: GridSweepCellRow[]): GridSweepItem {
  return {
    id: row.id,
    regionName: row.region_name,
    presetName: row.preset_name,
    status: row.status,
    originLat: row.origin_lat,
    originLng: row.origin_lng,
    cellSizeMeters: row.cell_size_meters,
    totalCells: row.total_cells,
    processedCells: row.processed_cells,
    successfulCells: row.successful_cells,
    failedCells: row.failed_cells,
    bbox: {
      south: row.bbox_south,
      west: row.bbox_west,
      north: row.bbox_north,
      east: row.bbox_east,
    },
    startedAt: row.started_at,
    completedAt: row.completed_at,
    cells: cells.map((cell) => ({
      id: cell.id,
      cellIndex: cell.cell_index,
      status: cell.status,
      bbox: {
        south: cell.south,
        west: cell.west,
        north: cell.north,
        east: cell.east,
      },
      fetchedCount: cell.fetched_count,
      preparedCount: cell.prepared_count,
      errorMessage: cell.error_message,
      completedAt: cell.completed_at,
    })),
  }
}
