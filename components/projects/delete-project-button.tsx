"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

type DeleteProjectButtonProps = {
  projectId: string
  projectName?: string | null
  redirectTo?: string
}

export function DeleteProjectButton({ projectId, projectName, redirectTo = "/dashboard/projects" }: DeleteProjectButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Delete project "${projectName || "Untitled"}"? This cannot be undone.`)) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("projects").delete().eq("id", projectId)
      if (error) {
        console.error("Failed to delete project", error)
        alert("Could not delete project. Please try again.")
        return
      }
      router.push(redirectTo)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      className="bg-red-600 hover:bg-red-700 text-white border border-red-500/60"
      disabled={loading}
    >
      {loading ? "Deleting…" : "Delete project"}
    </Button>
  )
}
