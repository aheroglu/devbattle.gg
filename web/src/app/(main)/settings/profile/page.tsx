"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Input } from "@/components/shared/ui/input";
import { Button } from "@/components/shared/ui/button";
import { Textarea } from "@/components/shared/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/shared/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shared/ui/avatar";
import { useToast } from "@/components/shared/ui/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";

const profileFormSchema = z.object({
  username: z.string()
    .min(3, { message: "Kullanıcı adı en az 3 karakter olmalıdır" })
    .max(20, { message: "Kullanıcı adı en fazla 20 karakter olabilir" })
    .regex(/^[a-zA-Z0-9_-]+$/, { message: "Kullanıcı adı sadece harf, rakam, tire ve alt çizgi içerebilir" }),
  full_name: z.string().max(50, { message: "Ad soyad en fazla 50 karakter olabilir" }).optional().nullable(),
  bio: z.string().max(160, { message: "Biyografi en fazla 160 karakter olabilir" }).optional().nullable(),
  location: z.string().max(50, { message: "Konum en fazla 50 karakter olabilir" }).optional().nullable(),
  website: z.string().url({ message: "Geçerli bir URL giriniz" }).optional().nullable(),
  github_url: z.string().url({ message: "Geçerli bir GitHub URL'si giriniz" }).optional().nullable(),
  twitter_url: z.string().url({ message: "Geçerli bir Twitter URL'si giriniz" }).optional().nullable(),
  avatar_url: z.string().url({ message: "Geçerli bir avatar URL'si giriniz" }).optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileSettingsPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      full_name: "",
      bio: "",
      location: "",
      website: "",
      github_url: "",
      twitter_url: "",
      avatar_url: "",
    },
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push("/auth/login");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;

        if (data) {
          form.reset({
            username: data.username || "",
            full_name: data.full_name || "",
            bio: data.bio || "",
            location: data.location || "",
            website: data.website || "",
            github_url: data.github_url || "",
            twitter_url: data.twitter_url || "",
            avatar_url: data.avatar_url || "",
          });
        }
      } catch (error) {
        console.error("Profile loading error:", error);
        toast({
          title: "Hata!",
          description: "Profil bilgileri yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [form, router, supabase, toast]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/auth/login");
        return;
      }

      // Kullanıcı adının benzersiz olduğunu kontrol et
      if (values.username !== form.getValues("username")) {
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", values.username)
          .single();

        if (existingUser) {
          form.setError("username", {
            type: "manual",
            message: "Bu kullanıcı adı zaten kullanılıyor",
          });
          return;
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          username: values.username,
          full_name: values.full_name,
          bio: values.bio,
          location: values.location,
          website: values.website,
          github_url: values.github_url,
          twitter_url: values.twitter_url,
          avatar_url: values.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.user.id);

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Profil bilgileriniz güncellendi.",
      });

      router.refresh();
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Hata!",
        description: "Profil güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-6 text-gray-300 hover:text-green-400 hover:bg-green-400/10"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Geri Dön
      </Button>

      <Card className="bg-black/80 border-green-400/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-green-400">Profil Ayarları</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={form.watch("avatar_url") || undefined} />
                  <AvatarFallback>
                    {form.watch("username")?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <FormField
                  control={form.control}
                  name="avatar_url"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Avatar URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/avatar.png" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kullanıcı Adı</FormLabel>
                      <FormControl>
                        <Input placeholder="kullanici_adi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad Soyad</FormLabel>
                      <FormControl>
                        <Input placeholder="Ad Soyad" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Konum</FormLabel>
                      <FormControl>
                        <Input placeholder="İstanbul, Türkiye" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="github_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub</FormLabel>
                      <FormControl>
                        <Input placeholder="https://github.com/username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="twitter_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter</FormLabel>
                      <FormControl>
                        <Input placeholder="https://twitter.com/username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biyografi</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Kendinizden kısaca bahsedin..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-400/30"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Değişiklikleri Kaydet
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
