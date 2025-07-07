import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService } from '../../../services/task.service';
import { Task } from '../../../models/task.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-task-form',
  standalone: false,
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  editing: boolean = false;
  currentTaskId: number | null = null;
  taskForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private snackBar: MatSnackBar
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      isCompleted: [false]
    });
  }

  ngOnInit(): void {
    this.taskService.selectedTask$.subscribe(task => {
      if (task) {
        this.editing = true;
        this.currentTaskId = task.id;
        this.taskForm.patchValue(task);
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched(); 
      return;
    }

    const task: Task = {
      id: this.currentTaskId || 0,
      userId: undefined,
      title: this.taskForm.value.title,
      description: this.taskForm.value.description,
      isCompleted: this.taskForm.value.isCompleted,
      createdAt: undefined 
    };

    if (this.editing) {
      this.taskService.updateTask(task).subscribe({
        next: () => {
          this.snackBar.open('Task updated successfully!', 'Close', { duration: 3000 });
          this.resetForm();
          this.taskService.triggerReload();
        },
        error: () => this.snackBar.open('Failed to update task', 'Close', { duration: 3000 })
      });
    } else {
      this.taskService.createTask(task).subscribe({
        next: () => {
          this.snackBar.open('Task created successfully!', 'Close', { duration: 3000 });
          this.resetForm();
          this.taskService.triggerReload();
        },
        error: () => this.snackBar.open('Failed to create task', 'Close', { duration: 3000 })
      });
    }
  }

  resetForm(): void {
    this.taskForm.reset({ title: '', description: '', isCompleted: false });
    this.editing = false;
    this.currentTaskId = null;
    console.log(this.taskForm.controls);
    
  }
}
