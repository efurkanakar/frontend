import { useState, type CSSProperties } from 'react'
import type { PlanetCreateInput } from '../api/types'
import { isApiError } from '../api/http'
import { useCreatePlanet, useDeletePlanet } from '../hooks/usePlanets'

export interface PlanetManagementProps {
  buttonStyle: CSSProperties
}

const sectionStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  marginTop: '2.5rem',
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gap: '1.5rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
}

const cardStyle: CSSProperties = {
  background: 'rgba(15, 23, 42, 0.75)',
  border: '1px solid rgba(148, 163, 184, 0.25)',
  borderRadius: '1rem',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  boxShadow: '0 20px 45px rgba(15, 23, 42, 0.35)',
}

const formStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
}

const labelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
  fontSize: '0.85rem',
  color: 'rgba(226, 232, 240, 0.8)',
}

const inputStyle: CSSProperties = {
  padding: '0.65rem 0.75rem',
  borderRadius: '0.75rem',
  border: '1px solid rgba(148, 163, 184, 0.35)',
  background: 'rgba(15, 23, 42, 0.6)',
  color: '#f8fafc',
}

const helperTextStyle: CSSProperties = {
  fontSize: '0.75rem',
  color: 'rgba(148, 163, 184, 0.85)',
}

const feedbackStyle: CSSProperties = {
  fontSize: '0.85rem',
}

const toOptionalNumber = (value: string): number | undefined => {
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    return undefined
  }
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : undefined
}

const normalisePayload = (form: PlanetCreateInput): PlanetCreateInput => {
  const payload: PlanetCreateInput = {
    name: form.name.trim(),
  }

  if (form.disc_method?.trim()) {
    payload.disc_method = form.disc_method.trim()
  }

  if (typeof form.disc_year === 'number' && Number.isFinite(form.disc_year)) {
    payload.disc_year = form.disc_year
  }

  return payload
}

const formatErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    const details = (error.details as { detail?: unknown })?.detail
    if (typeof details === 'string' && details.length > 0) {
      return details
    }

    if (Array.isArray(details) && details.length > 0) {
      const first = details[0] as { msg?: string }
      if (typeof first?.msg === 'string') {
        return first.msg
      }
    }

    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Unexpected error while communicating with the API.'
}

interface FeedbackState {
  status: 'success' | 'error'
  message: string
}

export const PlanetManagement = ({ buttonStyle }: PlanetManagementProps) => {
  const createMutation = useCreatePlanet()
  const deleteMutation = useDeletePlanet()

  const [createForm, setCreateForm] = useState({
    name: '',
    disc_method: '',
    disc_year: '',
  })
  const [deleteId, setDeleteId] = useState('')
  const [createFeedback, setCreateFeedback] = useState<FeedbackState | null>(null)
  const [deleteFeedback, setDeleteFeedback] = useState<FeedbackState | null>(null)

  return (
    <section style={sectionStyle} aria-labelledby="planet-management-heading">
      <header>
        <h2 id="planet-management-heading" style={{ marginBottom: '0.35rem' }}>
          Manage planets
        </h2>
        <p style={{ ...helperTextStyle, margin: 0 }}>
          Create new catalogue entries or trigger soft deletion using the official API endpoints.
        </p>
      </header>

      <div style={gridStyle}>
        <article style={cardStyle}>
          <div>
            <h3 style={{ margin: 0 }}>Add a planet</h3>
            <p style={helperTextStyle}>POST /planets/</p>
          </div>
          <form
            style={formStyle}
            onSubmit={(event) => {
              event.preventDefault()
              setCreateFeedback(null)

              const name = createForm.name.trim()
              if (!name) {
                setCreateFeedback({ status: 'error', message: 'Planet name is required.' })
                return
              }

              const discYear = toOptionalNumber(createForm.disc_year)
              if (createForm.disc_year.trim().length > 0 && discYear === undefined) {
                setCreateFeedback({ status: 'error', message: 'Discovery year must be a valid number.' })
                return
              }

              const payload = normalisePayload({
                name,
                disc_method: createForm.disc_method,
                disc_year: discYear,
              })

              createMutation.mutate(payload, {
                onSuccess: (planet) => {
                  setCreateFeedback({
                    status: 'success',
                    message: `Planet “${planet.name}” created with ID ${planet.id}.`,
                  })
                  setCreateForm({ name: '', disc_method: '', disc_year: '' })
                },
                onError: (error) => {
                  setCreateFeedback({ status: 'error', message: formatErrorMessage(error) })
                },
              })
            }}
          >
            <label style={labelStyle}>
              Planet name
              <input
                required
                style={inputStyle}
                type="text"
                value={createForm.name}
                onChange={(event) => setCreateForm((state) => ({ ...state, name: event.target.value }))}
                placeholder="e.g. Kepler-452 b"
              />
            </label>
            <label style={labelStyle}>
              Discovery method
              <input
                style={inputStyle}
                type="text"
                value={createForm.disc_method}
                onChange={(event) =>
                  setCreateForm((state) => ({ ...state, disc_method: event.target.value }))
                }
                placeholder="Transit, Radial Velocity, ..."
              />
            </label>
            <label style={labelStyle}>
              Discovery year
              <input
                style={inputStyle}
                type="number"
                inputMode="numeric"
                value={createForm.disc_year}
                onChange={(event) =>
                  setCreateForm((state) => ({ ...state, disc_year: event.target.value }))
                }
                placeholder="2024"
              />
            </label>
            <button
              type="submit"
              style={buttonStyle}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating…' : 'Create planet'}
            </button>
            <p
              style={{
                ...feedbackStyle,
                color:
                  createFeedback?.status === 'error'
                    ? '#fca5a5'
                    : createFeedback?.status === 'success'
                      ? '#86efac'
                      : 'transparent',
                minHeight: '1.2em',
                margin: 0,
              }}
              role="status"
              aria-live="polite"
            >
              {createFeedback?.message ?? ''}
            </p>
          </form>
        </article>

        <article style={cardStyle}>
          <div>
            <h3 style={{ margin: 0 }}>Remove a planet</h3>
            <p style={helperTextStyle}>DELETE /planets/{{planet_id}}</p>
          </div>
          <form
            style={formStyle}
            onSubmit={(event) => {
              event.preventDefault()
              setDeleteFeedback(null)

              const planetId = toOptionalNumber(deleteId)
              if (planetId === undefined) {
                setDeleteFeedback({ status: 'error', message: 'Enter a valid numeric planet ID.' })
                return
              }

              deleteMutation.mutate(planetId, {
                onSuccess: () => {
                  setDeleteFeedback({
                    status: 'success',
                    message: `Planet ${planetId} queued for soft deletion.`,
                  })
                  setDeleteId('')
                },
                onError: (error) => {
                  setDeleteFeedback({ status: 'error', message: formatErrorMessage(error) })
                },
              })
            }}
          >
            <label style={labelStyle}>
              Planet ID
              <input
                style={inputStyle}
                type="number"
                inputMode="numeric"
                value={deleteId}
                onChange={(event) => setDeleteId(event.target.value)}
                placeholder="1234"
              />
              <span style={helperTextStyle}>
                Soft deletion requires an admin key when the API is configured to enforce it.
              </span>
            </label>
            <button
              type="submit"
              style={buttonStyle}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete planet'}
            </button>
            <p
              style={{
                ...feedbackStyle,
                color:
                  deleteFeedback?.status === 'error'
                    ? '#fca5a5'
                    : deleteFeedback?.status === 'success'
                      ? '#86efac'
                      : 'transparent',
                minHeight: '1.2em',
                margin: 0,
              }}
              role="status"
              aria-live="polite"
            >
              {deleteFeedback?.message ?? ''}
            </p>
          </form>
        </article>
      </div>
    </section>
  )
}
