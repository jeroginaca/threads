"use server"

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string,
}

export const createThread = async ({ text, author, communityId, path }: Params) => {

    try {
        
        connectToDB();
        
        const createdThread = await Thread.create({
            text,
            author,
            community: null,
        });
        
        // Actualizar model de user
        await User.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id }
        })
        
        revalidatePath(path)
    } catch (error: any) {
        throw new Error(`Error creating thread: ${error.message}`)

    }
}

export const fetchPosts = async (pageNumber = 1, pageSize = 20) => {
    connectToDB();

    const skipAmount = (pageNumber -1) * pageSize;

    const postsQuery = Thread.find({ parentId: { $in: [null, undefined]} })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: "author", model: User}) // Carga automáticamente referencias a otros documentos relacionados con los autores de los threads en una colección de MongoDB.
    .populate({ 
        path: "children", 
        populate: {
            path: "author",
            model: User,
            select: "_id name parentId image"
        }
    })

    const totalPostsCount = await Thread.countDocuments({ parentId: { $in: [null, undefined]} })

    const posts = await postsQuery.exec();

    const isNext = totalPostsCount > skipAmount + posts.length;

    return { posts, isNext }
}

export const fetchThreadById = async (id: string) => {
    connectToDB();

    try {
        const thread = await Thread.findById(id)
            .populate({
                path: "author",
                model: User,
                select: "_id id name image"
            })
            .populate({
                path:"children",
                populate: [
                    {
                        path: "author",
                        model: User,
                        select: "_id id name parentId image"
                    },
                    {
                        path: "children",
                        model: Thread,
                        populate: {
                            path: "author",
                            model: User,
                            select: "_id id name parentId image"
                        }
                    }
                ]
            }).exec();

            return thread;
        
    } catch (error: any) {
        throw new Error(`Error fetching thread: ${error.message}`)
    }
}

export const addCommentToThread = async (
    threadId: string,
    commentText: string,
    userId: string,
    path:string,
) => {
    connectToDB();
    
    try {
        // Encontrar el Thread original por su Id
        const originalThread = await Thread.findById(threadId);

        if(!originalThread){
            throw new Error ("Thread not found")
        }

        // Crear nuevo Thread con el comentario
        const commentThread = new Thread({
            text: commentText,
            author: userId,
            parentId: threadId,
        })

        // Guardando el comentario en la base de datos
        const savedCommentThread = await commentThread.save();

        // Luego queremos actualizar el Thread original con el comentario nuevo
        originalThread.children.push(savedCommentThread._id);

        // Guardar el Thread original 
        await originalThread.save();

        // Revalidar el path para que se muestre instantaneamente.
        revalidatePath(path);

    } catch (error: any) {
        throw new Error(`Error fetching thread: ${error.message}`)
    }
}