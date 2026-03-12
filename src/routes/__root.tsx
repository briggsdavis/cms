import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  Link,
  useNavigate,
} from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"
import { useSuspenseQuery } from "@tanstack/react-query"
import { convexQuery } from "@convex-dev/react-query"
import { useMutation } from "convex/react"
import slugify from "@sindresorhus/slugify"
import { useEffect, useState, Suspense } from "react"
import { Sun, Moon, ChevronDown, ChevronUp } from "lucide-react"
import { api } from "../../convex/_generated/api"
import appCss from "~/styles/app.css?url"

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "Briggs Davis CMS" },
      ],
      links: [{ rel: "stylesheet", href: appCss }],
    }),
    component: Root,
  },
)

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    const initial =
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)
        ? "dark"
        : "light"
    setTheme(initial)
  }, [])

  function toggle() {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    localStorage.setItem("theme", next)
    document.documentElement.setAttribute("data-theme", next)
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-2 py-1.5 rounded w-full"
    >
      {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
      <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
    </button>
  )
}

function Sidebar() {
  const { data: projects } = useSuspenseQuery(
    convexQuery(api.projects.list, {}),
  )
  const create = useMutation(api.projects.create)
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState("")

  const active = projects.filter((p) => !p.archived)
  const archived = projects.filter((p) => p.archived)
  const [showArchived, setShowArchived] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const slug = slugify(name.trim())
    await create({ name: name.trim(), slug })
    setName("")
    setAdding(false)
    navigate({ to: "/$slug", params: { slug } })
  }

  return (
    <aside className="w-52 shrink-0 border-r dark:border-gray-800 flex flex-col h-screen sticky top-0">
      <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-0.5 pt-6">
        <Link
          to="/"
          className="text-sm px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          activeProps={{
            className: "bg-gray-100 dark:bg-gray-800 font-medium",
          }}
          activeOptions={{ exact: true }}
        >
          Dashboard
        </Link>

        <div className="mt-3 flex flex-col gap-0.5">
          {active.map((p) => (
            <Link
              key={p._id}
              to="/$slug"
              params={{ slug: p.slug }}
              className="text-sm px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 truncate"
              activeProps={{
                className:
                  "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100",
              }}
            >
              {p.name}
            </Link>
          ))}
        </div>

        <div className="mt-1">
          {adding ? (
            <form onSubmit={handleCreate}>
              <input
                autoFocus
                className="w-full text-sm px-2 py-1.5 border rounded bg-transparent dark:border-gray-700 dark:placeholder-gray-500 outline-none"
                placeholder="Project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => {
                  if (!name.trim()) setAdding(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setAdding(false)
                }}
              />
            </form>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="text-sm px-2 py-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 w-full text-left"
            >
              + New project
            </button>
          )}
        </div>
      </nav>

      {archived.length > 0 && (
        <div className="px-3 py-2 border-t dark:border-gray-800">
          <button
            onClick={() => setShowArchived((v) => !v)}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 w-full text-left px-2 py-2"
          >
            <span className="flex items-center gap-1">
              Archived ({archived.length})
              {showArchived ? (
                <ChevronUp size={12} />
              ) : (
                <ChevronDown size={12} />
              )}
            </span>
          </button>
          {showArchived && (
            <div className="flex flex-col gap-0.5">
              {archived.map((p) => (
                <Link
                  key={p._id}
                  to="/$slug"
                  params={{ slug: p.slug }}
                  className="text-xs px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 truncate"
                  activeProps={{
                    className:
                      "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
                  }}
                >
                  {p.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="p-3 border-t dark:border-gray-800">
        <ThemeToggle />
      </div>
    </aside>
  )
}

function Root() {
  return (
    <html suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t)})()`,
          }}
        />
        <HeadContent />
      </head>
      <body>
        <div className="flex h-screen">
          <Suspense
            fallback={
              <div className="w-52 shrink-0 border-r dark:border-gray-800" />
            }
          >
            <Sidebar />
          </Suspense>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
        <Scripts />
      </body>
    </html>
  )
}
