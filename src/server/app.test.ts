import { describe, expect, it } from 'vitest'
import { createApp } from './app'
import { createMemoryStore } from './store'

describe('API', () => {
  const app = () =>
    createApp(
      createMemoryStore([
        { id: 1, title: 'Test', category: 'A', note: '', done: false, createdAt: '2026-01-01T00:00:00.000Z' },
      ]),
    )

  it('health liefert ok', async () => {
    const res = await app().request('/api/health')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'ok' })
  })

  it('GET /api/items liefert die Einträge', async () => {
    const res = await app().request('/api/items')
    const body = (await res.json()) as unknown[]
    expect(body).toHaveLength(1)
  })

  it('POST /api/items legt einen gültigen Eintrag an', async () => {
    const res = await app().request('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Neuer Eintrag' }),
    })

    expect(res.status).toBe(201)
    await expect(res.json()).resolves.toMatchObject({
      title: 'Neuer Eintrag',
      category: 'Allgemein',
      note: '',
      done: false,
    })
  })

  it('POST /api/items lehnt ungültige Eingaben ab', async () => {
    const res = await app().request('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: ' ' }),
    })

    expect(res.status).toBe(400)
  })

  it('PATCH /api/items/:id aktualisiert einen Eintrag', async () => {
    const res = await app().request('/api/items/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: true }),
    })

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({ id: 1, done: true })
  })

  it('PATCH /api/items/:id liefert 404 für unbekannte Einträge', async () => {
    const res = await app().request('/api/items/2', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: true }),
    })

    expect(res.status).toBe(404)
  })

  it('DELETE /api/items/:id löscht einen Eintrag mit Status 204', async () => {
    const res = await app().request('/api/items/1', { method: 'DELETE' })

    expect(res.status).toBe(204)
    expect(await res.text()).toBe('')
  })

  it('DELETE /api/items/:id liefert 404 für unbekannte Einträge', async () => {
    const res = await app().request('/api/items/2', { method: 'DELETE' })

    expect(res.status).toBe(404)
  })
})
