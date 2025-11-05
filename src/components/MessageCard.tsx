'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Message } from "@/model/User"
import { toast } from "sonner"
import { ApiResponse } from "@/types/ApiResponse"
import axios from "axios"
import { useState } from "react"

type MessageCardProps = {
  message: Message
  onMessageDelete: (messageId: string) => void
}

function MessageCard({ message, onMessageDelete }: MessageCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true)
      const response = await axios.delete<ApiResponse>(`/api/delete-message/${message._id}`)
      
      if (response.data.success) {
        toast.success("Message deleted successfully")
        onMessageDelete(message._id)
      } else {
        toast.error(response.data.message || "Failed to delete message")
      }
    } catch (error) {
      toast.error("Something went wrong while deleting the message")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="bg-white shadow-md rounded-lg">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">
            Anonymous Message
          </CardTitle>
          <CardDescription className="text-gray-600">
            {message.createdAt
              ? new Date(message.createdAt).toLocaleString()
              : "Unknown date"}
          </CardDescription>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon" disabled={isDeleting}>
              <X className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this message from your inbox.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>

      <CardContent>
        <p className="text-gray-800 whitespace-pre-line">{message.content}</p>
      </CardContent>

      <CardFooter className="text-sm text-gray-500">
        Message ID: {message._id}
      </CardFooter>
    </Card>
  )
}

export default MessageCard
