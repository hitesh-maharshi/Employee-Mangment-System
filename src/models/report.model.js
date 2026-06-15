import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
    {
        userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
        },
        report : {
                type : String,
                required : [true, "Report is required"],
                trim : true
        },

    },
    {
        timestamps : {
            createdAt : "created_at",
        }
    }
);

const Report = mongoose.model("Report", reportSchema);
 export { Report };
    