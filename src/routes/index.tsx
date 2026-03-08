import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { useState } from 'react'
import slugify from '@sindresorhus/slugify'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { data: projects } = useSuspenseQuery(convexQuery(api.projects.list, {}))
  const create = useMutation(api.projects.create)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await create({ name, slug: slugify(name) })
      setName('')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <main className="max-w-xl mx-auto p-8 flex flex-col gap-8">
      <h1 className="text-xl font-semibold">Projects</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          className="border rounded px-3 py-2 text-sm"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="self-start bg-gray-900 text-white text-sm px-4 py-2 rounded"
        >
          Create project
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {projects.map((p) => (
          <li key={p._id}>
            <Link
              to="/$slug"
              params={{ slug: p.slug }}
              className="flex items-center justify-between border rounded px-3 py-2 text-sm hover:bg-gray-100"
            >
              <span>{p.name}</span>
              <span className="text-gray-400">{p.slug}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
