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
        date : {
            type : Date,
            default : Date.now
        }

    },
    {
        timestamps : true
    }
);

const Report = mongoose.model("Report", reportSchema);
 export { Report };
    