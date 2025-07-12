import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { apiService } from "../../lib/api";
import { Select, SelectItem } from "../ui/select";

export type TaskFormValues = {
  projectId: string;
  datasetId: string;
  inputData: any;
  assignedToId?: string;
  estimatedHours: number;
  payment: number;
  priority: string;
  completedAt?: string;
};

const PRIORITY_OPTIONS = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

export function TaskCreateForm({ onSuccess }: { onSuccess?: () => void }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TaskFormValues>({
    defaultValues: { estimatedHours: 1, payment: 0, priority: "Medium" },
  });

  const onSubmit = async (data: TaskFormValues) => {
    try {
      await apiService.createTask(data);
      reset();
      onSuccess?.();
    } catch (e) {
      // TODO: Show error to user
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} aria-label="Create Task" className="space-y-4">
      <div>
        <label htmlFor="projectId" className="block font-medium">Project ID*</label>
        <Input id="projectId" {...register("projectId", { required: "Project ID is required" })} />
        {errors.projectId && <span className="text-red-600 text-sm">{errors.projectId.message}</span>}
      </div>
      <div>
        <label htmlFor="datasetId" className="block font-medium">Dataset ID*</label>
        <Input id="datasetId" {...register("datasetId", { required: "Dataset ID is required" })} />
        {errors.datasetId && <span className="text-red-600 text-sm">{errors.datasetId.message}</span>}
      </div>
      <div>
        <label htmlFor="inputData" className="block font-medium">Input Data (JSON)*</label>
        <textarea id="inputData" {...register("inputData", { required: "Input Data is required" })} className="w-full border rounded px-3 py-2" />
        {errors.inputData && <span className="text-red-600 text-sm">{errors.inputData.message}</span>}
      </div>
      <div>
        <label htmlFor="assignedToId" className="block font-medium">Assigned To (User ID)</label>
        <Input id="assignedToId" {...register("assignedToId")} />
      </div>
      <div>
        <label htmlFor="estimatedHours" className="block font-medium">Estimated Hours*</label>
        <Input
          id="estimatedHours"
          type="number"
          min={0}
          step={0.1}
          {...register("estimatedHours", { required: "Estimated hours is required", min: { value: 0, message: "Must be positive" } })}
        />
        {errors.estimatedHours && <span className="text-red-600 text-sm">{errors.estimatedHours.message}</span>}
      </div>
      <div>
        <label htmlFor="payment" className="block font-medium">Payment*</label>
        <Input
          id="payment"
          type="number"
          min={0}
          step={0.01}
          {...register("payment", { required: "Payment is required", min: { value: 0, message: "Must be positive" } })}
        />
        {errors.payment && <span className="text-red-600 text-sm">{errors.payment.message}</span>}
      </div>
      <div>
        <label htmlFor="priority" className="block font-medium">Priority*</label>
        <Controller
          name="priority"
          control={control}
          rules={{ required: "Priority is required" }}
          render={({ field }) => (
            <Select value={field.value} onChange={field.onChange}>
              {PRIORITY_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value} selected={field.value === opt.value} onSelect={() => field.onChange(opt.value)}>{opt.label}</SelectItem>
              ))}
            </Select>
          )}
        />
        {errors.priority && <span className="text-red-600 text-sm">{errors.priority.message}</span>}
      </div>
      <div>
        <label htmlFor="completedAt" className="block font-medium">Completed At</label>
        <Controller
          name="completedAt"
          control={control}
          render={({ field }) => (
            <Input id="completedAt" type="date" {...field} />
          )}
        />
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">Create Task</Button>
    </form>
  );
} 