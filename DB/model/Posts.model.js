import { model, Schema, Types } from 'mongoose';


const postsSchema = new Schema({
    content: { type: String, required: true},
    images:[ { type: Object },],
    videos:[ { type: Object }],
    likes:[{ type: Types.ObjectId, ref:'User'}],
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    privacy: { type: String, enum: ['only me', 'friends'], default: 'friends' }, 
    isDeleted:{type:Boolean ,default:false}
}, {
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
    timestamps: true
})
postsSchema.virtual('comments',{
    localField:'_id',
    foreignField:'postId',
    ref:'Comment'
})
postsSchema.virtual('replaycomments',{
    localField:'_id',
    foreignField:'postId',
    ref:'CommentReply'
})
const postsModel = model('Post', postsSchema)

export default postsModel