import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
    id: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true},
    image: String,
    bio: String,

    // Esta nos va a servir de referencia de tipo mongoose.schema.types al usuario.
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    threads: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Thread"
        }
    ],
    
    // Aqui tendremos acceso a los miembros.
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]

});

const Community = mongoose.models.Community || mongoose.model("Community", communitySchema);

export default Community;