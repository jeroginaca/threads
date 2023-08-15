"use server"
import { FilterQuery, SortOrder } from "mongoose";
import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"

import Thread from "../models/thread.model";

interface Params {
    userId: string,
    username: string,
    name: string,
    bio: string,
    image: string,
    path: string,
}

export async function updateUser({
    userId,
    username,
    name,
    bio,
    image,
    path,
    }: Params): Promise<void> {
    connectToDB();

    try {
        await User.findOneAndUpdate(
            { id: userId },
            {
                username: username.toLowerCase(),
                name,
                bio,
            image,
            onboarded: true,
        },
        { upsert: true }
        );
        
        if(path === "/profile/edit"){
            revalidatePath(path)
        }
    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`)
    }
}

export const fetchUser = async  (userId: string) => {
    try {
        connectToDB();

        return await User
            .findOne({ id: userId })
            // .populate({ lo vamos a hacer cuando tengamos las communities.
            //     path: "communities",        
            //     model: Community
            // }) 
    } catch (error: any) {
        throw new Error(`Failed to fetch user: ${error.message}`)
        
    }
}

export const fetchUserPosts = async (userId: string) => {
    try {
        connectToDB();

        // Encontrar todas las Threas de este usuario especifico.
        const threads = await User.findOne({ id: userId })
            .populate({
                path: "threads",
                model: Thread,
                populate: {
                    path: "children",
                    model: Thread,
                    populate: {
                        path: "author",
                        model: User,
                        select: "name image id"
                    }
                }
            })

            return threads;

    } catch (error: any) {
        throw new Error(`Failed to fetch post: ${error.message}`)
        
    }
}

export const fetchUsers = async ({
    userId,
    searchString = "",
    pageNumber = 1,
    pageSize = 20,
    sortBy = "desc"
}: {
     userId: string;
     searchString?: string;
     pageNumber?: number; 
     pageSize?: number; 
     sortBy?: SortOrder; 
 }) => {

    try {
        connectToDB();

        // calcular el numero de usuarios que saltar
        const skipAmount = (pageNumber - 1) * pageSize;

        // una funcion regular case insensitive para buscar a los usuarios
        const regex = new RegExp(searchString, "i");

        const query: FilterQuery<typeof User> = {
            id: { $ne: userId }
        }

        if(searchString.trim() !==""){
            query.$or = [
                { username: { $regex: regex } },
                { name: { $regex: regex } }
            ]
        }

        const sortOptions = { createdAt: sortBy };

        const usersQuery = User.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize)

        const totalUsersCount = await User.countDocuments(query);

        const users = await usersQuery.exec();

        const isNext = totalUsersCount > skipAmount + users.length;

        return { users, isNext};

    } catch (error: any) {
        throw new Error(`Failed to fetch users: ${error.message}`)
    }
}

export const getActivity = async (userId: string) => {

    try {
        connectToDB();

        // encontrar todos los threads hechos por el usuario
        const userThreads = await Thread.find({ author: userId })

        // Recopilar todos los todos los ids de las respuestas al Thread orignal. Entonces hacemos un map por todos los Threads con reduce y luego vamos a acumularlos y devolver los comentarios como un array de childrens.

        // Básicamente agarra todos los comentarios que hayan en los Threads, y hace un nuevo array con todos los comentarios.
        const childThreadIds = userThreads.reduce((acc, userThread) => {    
            return acc.concat(userThread.children)
        }, []) // el array vacio es el valor inicial del acumulador.

        // ahora vamos a exlcluir los Threads del usuario que esta buscando
        const replies = await Thread.find({
            _id: { $in: childThreadIds },
            author: { $ne: userId }
        }).populate({
            path: "author",
            model: User,
            select: "name image _id"
        })

        return replies

    } catch (error: any) {
        throw new Error(`Failed to fetch activity: ${error.message}`)
    }
}

