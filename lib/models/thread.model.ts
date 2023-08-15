import mongoose from "mongoose";

const threadSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true, 
    },
    community: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Community",
    },
    createdAt: { 
        type: Date, 
        default: Date.now,
    },
    parentId:{ // en caso que sea un comentario.
        type: String,
    },
    children: [ // Porque cada Thread puede tener multiples Threads de children.
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Thread"
        }
    ]

});

const Thread = mongoose.models.Thread || mongoose.model("Thread", threadSchema);

export default Thread;