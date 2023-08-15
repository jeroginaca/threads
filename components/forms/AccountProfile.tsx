"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { UserValidation } from "@/lib/validations/user";
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image";
import * as z from "zod"
import { ChangeEvent, useState } from "react";
import { isBase64Image } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing"
import { updateUser } from "@/lib/actions/user.actions";
import { usePathname, useRouter } from "next/navigation";

interface Props {
    user: {
        id: string;
        objectId: string;
        username: string;
        name: string;
        bio: string;
        image: string;
    };
    btnTitle: string;
}

const AccountProfile = ({ user, btnTitle }: Props) => {
    const [files, setFiles] = useState<File[]>([]);
    const { startUpload } = useUploadThing("media");

    const router = useRouter();
    const pathname = usePathname();

    const form = useForm({
        resolver: zodResolver(UserValidation),
        defaultValues: {
            profile_photo: user?.image || "",
            name: user?.name || "",
            username: user?.username || "",
            bio: user?.bio || "",
        }
    });

    const handleImage = (e: ChangeEvent<HTMLInputElement>, fieldChange: (value: string)=> void ) => {
        e.preventDefault();

        const fileReader = new FileReader();

        if(e.target.files && e.target.files.length > 0) { // si hay archivos, y si el largo del archivo es mayor que uno
            const file = e.target.files[0];

            setFiles(Array.from(e.target.files)); // usamos la función de seteo de nuestro estado.

            if(!file.type.includes("image")) return; // Si no hay imagen salir de la función

            fileReader.onload = async (e) => { // si hay imagen leemos el url y lo pasamos a string, o sino un string vacio si no hay nada.
                const imageDataUrl = e.target?.result?.toString() || "";

                fieldChange(imageDataUrl); // actualizamos el campo con la url de la imagen
            }

            fileReader.readAsDataURL(file); // finalmente le pasamos el archivo
        }
    }

    const onSubmit = async (values: z.infer<typeof UserValidation>) => {
        const blob = values.profile_photo;

        const hasImageChanged = isBase64Image(blob);

        if(hasImageChanged) {
            const imgRes = await startUpload(files)
            
            if(imgRes && imgRes[0].fileUrl) {
                values.profile_photo = imgRes[0].fileUrl;
            }
        }

        await updateUser({
            userId: user.id,
            username: values.username,
            name: values.name,
            bio: values.bio,
            image: values.profile_photo,
            path: pathname
        });

        if(pathname === "/profile/edit"){
          router.back();
        } else {
          router.push("/");
        }
      }

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="flex flex-col justify-start gap-10"
        >
        <FormField
          control={form.control}
          name="profile_photo"
          render={({ field }) => (
            <FormItem className="flex items-center gap-4">
              <FormLabel className="account-form_image-label">
                {field.value ? (
                    <Image 
                        src={field.value}
                        alt="profile_photo"
                        width={96}
                        height={96}
                        priority
                        className="rounded-full object-contain"
                    />
                ) : (
                    <Image 
                        src="/assets/profile.svg"
                        alt="profile photo"
                        width={24}
                        height={24}
                        className="object-contain"
                    />   

                )}
              </FormLabel>
              <FormControl className="flex-1 text-base-semibold text-gray-200">
                <Input 
                    type="file"
                    accept="image/*"
                    placeholder="Uplead a photo"
                    className="account-form_image-input"
                    onChange={(e) => handleImage(e, field.onChange)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel className="text-base-semibold text-light-2">
                Name
              </FormLabel>
              <FormControl>
                <Input 
                    type="text"
                    className="account-form_input no-focus"
                   {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />   

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel className="text-base-semibold text-light-2">
                Username
              </FormLabel>
              <FormControl>
                <Input 
                    type="text"
                    className="account-form_input no-focus"
                   {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />     

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel className="text-base-semibold text-light-2">
                Bio
              </FormLabel>
              <FormControl>
                <Textarea 
                    rows={10}
                    className="account-form_input no-focus"
                   {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />    
         

        <Button type="submit" className="bg-primary-500">Submit</Button>
      </form>
    </Form>
  )
}

export default AccountProfile