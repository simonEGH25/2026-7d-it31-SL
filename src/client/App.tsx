import { useEffect, useState } from 'preact/hooks'
import type { Item } from '../shared/schemas'
import { api } from './api'

export function App() {
  const [items, setItems] = useState<Item[]>([])
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    api
      .list()
      .then(setItems)
      .catch((e: Error) => setError(e.message))
  }, [])

  async function createItem(event: Event) {
    event.preventDefault()
    setError('')
    try {
      const item = await api.create({ title, category, note: '' })
      setItems((current) => [...current, item])
      setTitle('')
      setCategory('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Der Gegenstand konnte nicht gespeichert werden.')
    }
  }

  async function toggleItem(item: Item) {
    setError('')
    try {
      const updated = await api.update(item.id, { done: !item.done })
      setItems((current) => current.map((entry) => (entry.id === item.id ? updated : entry)))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Der Status konnte nicht geändert werden.')
    }
  }

  async function deleteItem(item: Item) {
    setError('')
    try {
      await api.remove(item.id)
      setItems((current) => current.filter((entry) => entry.id !== item.id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Der Gegenstand konnte nicht gelöscht werden.')
    }
  }

  return (
    <main class="mx-auto max-w-2xl p-6">
      <header class="mb-8 border-b border-slate-200 pb-6">
        <p class="mb-2 text-sm font-semibold uppercase tracking-wide text-brand">Reisevorbereitung</p>
        <h1 class="text-3xl font-bold text-slate-900">Meine Packliste</h1>
        <p class="mt-2 text-slate-600">Behalte im Blick, was schon im Gepäck ist und was noch fehlt.</p>
      </header>

      {error && (
        <p role="alert" class="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-800">
          {error}
        </p>
      )}

      <form onSubmit={createItem} class="mb-8 grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 class="text-lg font-semibold text-slate-900">Gegenstand hinzufügen</h2>
        <label class="grid gap-1 text-sm font-medium text-slate-700">
          Gegenstand
          <input
            required
            maxLength={80}
            value={title}
            onInput={(event) => setTitle(event.currentTarget.value)}
            placeholder="z. B. Reisepass"
            class="rounded border border-slate-300 px-3 py-2 text-base font-normal focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </label>
        <label class="grid gap-1 text-sm font-medium text-slate-700">
          Kategorie
          <input
            required
            maxLength={40}
            value={category}
            onInput={(event) => setCategory(event.currentTarget.value)}
            placeholder="z. B. Dokumente"
            class="rounded border border-slate-300 px-3 py-2 text-base font-normal focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </label>
        <button type="submit" class="w-fit rounded bg-brand px-4 py-2 font-semibold text-white hover:opacity-90">
          Zur Packliste hinzufügen
        </button>
      </form>

      <ul class="space-y-3">
        {items.map((item) => (
          <li key={item.id} class="flex items-start gap-3 rounded-lg border border-slate-200 p-4 shadow-sm">
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => void toggleItem(item)}
              aria-label={`„${item.title}“ eingepackt`}
              class="mt-1 h-4 w-4 accent-brand"
            />
            <div class="min-w-0 flex-1">
              <span class="text-xs uppercase tracking-wide text-slate-500">{item.category}</span>
              <h2 class={`font-semibold ${item.done ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                {item.title}
              </h2>
              {item.note && <p class="text-sm text-slate-600">{item.note}</p>}
            </div>
            <button
              type="button"
              onClick={() => void deleteItem(item)}
              class="rounded border border-red-300 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Löschen
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
