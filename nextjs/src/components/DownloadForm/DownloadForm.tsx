"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const formSchema = z.object({
  url: z.string().min(1, "L'URL est requise"),
  title: z.string().min(1, "Le titre est requis"),
});

export function DownloadForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      title: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { title, url } = values;

    // ID unique pour ce toast
    const toastId = toast.loading(`Téléchargement en cours : ${title}`);

    try {
      const response = await fetch("http://localhost:8055/m3u8", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || `Erreur ${response.status}`);
      }

      toast.success("Téléchargement terminé", {
        id: toastId,
        description: `Fichier: ${title} (ID: ${data.fileId})`,
        action: {
          label: "Voir",
          onClick: () => {
            window.open(`http://localhost:8055/admin/files/${data.fileId}`, "_blank");
          },
        },
      });
    } catch (error: any) {
      toast.error("Échec du téléchargement", {
        id: toastId,
        description: error.message || "Erreur inconnue",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                The master file of the m3u8 playlist
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="fireforce-vostfr-s1-1" {...field} />
              </FormControl>
              <FormDescription>File title in Directus</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Télécharger</Button>
      </form>
    </Form>
  );
}
