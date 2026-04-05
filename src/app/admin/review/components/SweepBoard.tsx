'use client'

import { useState } from 'react'
import { GridSweepItem } from '../types'
import {
  decodeLabel,
  formatSweepStatus,
  formatSweepMode,
  formatDate,
  formatBbox,
  formatCellStatus,
} from '../formatters'

export function SweepBoard({ sweeps }: { sweeps: GridSweepItem[] }) {
  const [openSweepId, setOpenSweepId] = useState<string | null>(null)

  if (sweeps.length === 0) {
    return (
      <section className="admin-empty-state">
        <strong>Henüz kaydedilmiş bir grid sweep yok.</strong>
        <p>Gerçek bir `import:google:grid` çalıştığında sweep kartları burada görünecek.</p>
      </section>
    )
  }

  return (
    <section className="sweep-board">
      {sweeps.map((sweep) => {
        const progress = sweep.totalCells > 0 ? Math.round((sweep.processedCells / sweep.totalCells) * 100) : 0
        const isOpen = openSweepId === sweep.id

        return (
          <article key={sweep.id} className="sweep-card sweep-card-places">
            <button
              type="button"
              className="sweep-card-header sweep-card-header-places"
              onClick={() => setOpenSweepId(isOpen ? null : sweep.id)}
            >
              <div className="sweep-card-copy-block">
                <span className={`review-pill review-pill-${sweep.status}`}>{formatSweepStatus(sweep.status)}</span>
                <h3 className="sweep-card-title">{decodeLabel(sweep.regionName)}</h3>
                <p className="sweep-card-copy">{formatSweepMode(sweep.presetName, sweep.cellSizeMeters)}</p>
              </div>
              <div className="sweep-card-meta">
                <span>Başlangıç: {formatDate(sweep.startedAt)}</span>
                <strong>İlerleme %{progress} <span className="sweep-card-caret">{isOpen ? '▲' : '▼'}</span></strong>
              </div>
            </button>

            <div className="sweep-progress-track" aria-hidden="true">
              <span className="sweep-progress-fill" style={{ width: `${progress}%` }} />
            </div>

            {isOpen ? (
              <div className="sweep-card-content sweep-card-content-places">
                <div className="sweep-stats-grid">
                  <div>
                    <span>Merkez nokta</span>
                    <strong>{sweep.originLat.toFixed(6)}, {sweep.originLng.toFixed(6)}</strong>
                  </div>
                  <div>
                    <span>Taranan alan</span>
                    <strong>{formatBbox(sweep.bbox)}</strong>
                  </div>
                  <div>
                    <span>İşlenen hücre</span>
                    <strong>{sweep.processedCells}/{sweep.totalCells}</strong>
                  </div>
                  <div>
                    <span>Başarılı / Hata</span>
                    <strong>{sweep.successfulCells} / {sweep.failedCells}</strong>
                  </div>
                </div>

                <div className="sweep-cell-list">
                  {sweep.cells.map((cell) => (
                    <div key={cell.id} className={`sweep-cell sweep-cell-${cell.status}`}>
                      <div className="sweep-cell-head">
                        <strong>Hücre #{cell.cellIndex}</strong>
                        <span>{formatCellStatus(cell.status)}</span>
                      </div>
                      <p>{cell.fetchedCount} aday bulundu, {cell.preparedCount} kayıt hazırlandı.</p>
                      <p>{formatBbox(cell.bbox)}</p>
                      {cell.errorMessage ? <p className="sweep-cell-error">{cell.errorMessage}</p> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </article>
        )
      })}
    </section>
  )
}
