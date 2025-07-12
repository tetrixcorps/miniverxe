import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { apiService } from "../../lib/api";

export type ProjectFormValues = {
  name: string;
  description?: string;
  budget: number;
  guidelines?: string;
  deadline: string;
};

export function ProjectCreateForm({ onSuccess }: { onSuccess?: () => void }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProjectFormValues>({
    defaultValues: { budget: 0 },
  });

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      await apiService.createProject(data);
      reset();
      onSuccess?.();
    } catch (e) {
      // TODO: Show error to user
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} aria-label="Create Project" className="space-y-4">
      <div>
        <label htmlFor="name" className="block font-medium">Name*</label>
        <Input id="name" {...register("name", { required: "Name is required" })} />
        {errors.name && <span className="text-red-600 text-sm">{errors.name.message}</span>}
      </div>
      <div>
        <label htmlFor="description" className="block font-medium">Description</label>
        <textarea id="description" {...register("description")} className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label htmlFor="budget" className="block font-medium">Budget*</label>
        <Input
          id="budget"
          type="number"
          min={0}
          step={0.01}
          {...register("budget", { required: "Budget is required", min: { value: 0, message: "Budget must be positive" } })}
        />
        {errors.budget && <span className="text-red-600 text-sm">{errors.budget.message}</span>}
      </div>
      <div>
        <label htmlFor="guidelines" className="block font-medium">Guidelines</label>
        <textarea id="guidelines" {...register("guidelines")} className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label htmlFor="deadline" className="block font-medium">Deadline*</label>
        <Controller
          name="deadline"
          control={control}
          rules={{ required: "Deadline is required" }}
          render={({ field }) => (
            <Input id="deadline" type="date" value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.deadline && <span className="text-red-600 text-sm">{errors.deadline.message}</span>}
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">Create Project</Button>
    </form>
  );
} 