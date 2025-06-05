import mongoose, { Schema, model, Document } from 'mongoose';

interface Task {
  _id?: mongoose.Types.ObjectId;
  taskTitle: string;
  taskDescription: string;
  status: 'todo' | 'doing' | 'done';
  createdBy: mongoose.Types.ObjectId;
  timestamp: {
    todo?: {
      date: Date;
      userId: mongoose.Types.ObjectId;
    };
    doing?: {
      date: Date;
      userId: mongoose.Types.ObjectId;
    };
    done?: {
      date: Date;
      userId: mongoose.Types.ObjectId;
    };
  };
  assignedTo: mongoose.Types.ObjectId[];
}

//schema
export interface ITasks extends Document {
  organisationId: mongoose.Types.ObjectId;
  tasks: Task[];
}

const TaskSchema = new Schema<ITasks>({
  organisationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organisation',
    required: true,
    unique: true 
  },
  tasks: [{
    taskTitle: { type: String, required: true },
    taskDescription: { type: String },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    status: { 
      type: String, 
      required: true,
      enum: ['todo', 'doing', 'done'],
      default: 'todo'
    },
    timestamp: {
      todo: {
        date: { type: Date },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      },
      doing: {
        date: { type:Date },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      },
      done: {
        date: { type: Date },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }]
});

// Create the Task model
export const TaskModel = model<ITasks>('Task', TaskSchema);