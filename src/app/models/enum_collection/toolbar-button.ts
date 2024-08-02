export enum ToolbarButtonType {
  Save = 'Save',
  Update = 'Update',
  New = 'New',
  Cancel = 'Cancel',
  SaveClose = 'Save & Close',
  Delete = 'Delete',
  Edit = 'Edit',
  ReStock = 'Re-stock'
}

export enum ToolbarComptype {
  AddRecipe = 'Add Recipe',
  AddRawMaterial = 'Add Raw Material',
}


export class ToolbarButtonClickEvent {
  buttonType: ToolbarButtonType;
  toolbarComponent: ToolbarComptype; // Assuming toolbarComponent is a string here, you can replace it with the actual type
}
