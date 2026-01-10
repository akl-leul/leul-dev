import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  ChevronRight,
  Settings2,
} from 'lucide-react';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, checkbox, radio
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  width?: 'full' | 'half';
}

interface FormContent {
  fields: FormField[];
  submitText: string;
  submitAction: 'email' | 'webhook' | 'supabase';
  recipientEmail?: string;
  webhookUrl?: string;
  supabaseTable?: string;
  successMessage?: string;
  showLabels?: boolean;
}

interface FormEditorProps {
  content: FormContent;
  onChange: (content: FormContent) => void;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'date', label: 'Date' },
  { value: 'file', label: 'File Upload' },
];

export function FormEditor({ content, onChange }: FormEditorProps) {
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [draggedField, setDraggedField] = useState<string | null>(null);
  const [dragOverField, setDragOverField] = useState<string | null>(null);

  const fields = content.fields || [];
  const submitText = content.submitText || 'Submit';
  const submitAction = content.submitAction || 'email';
  const showLabels = content.showLabels ?? true;
  const successMessage = content.successMessage || 'Thank you! Your submission has been received.';

  const addField = (type: FormField['type'] = 'text') => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type,
      label: `New ${FIELD_TYPES.find(t => t.value === type)?.label || 'Field'}`,
      placeholder: '',
      required: false,
      width: 'full',
    };
    
    if (type === 'select' || type === 'radio' || type === 'checkbox') {
      newField.options = ['Option 1', 'Option 2', 'Option 3'];
    }
    
    onChange({ ...content, fields: [...fields, newField] });
    setExpandedField(newField.id);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    const newFields = fields.map(field =>
      field.id === id ? { ...field, ...updates } : field
    );
    onChange({ ...content, fields: newFields });
  };

  const removeField = (id: string) => {
    onChange({ ...content, fields: fields.filter(field => field.id !== id) });
    if (expandedField === id) setExpandedField(null);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    onChange({ ...content, fields: newFields });
  };

  const updateOptions = (fieldId: string, optionsText: string) => {
    const options = optionsText.split('\n').filter(opt => opt.trim());
    updateField(fieldId, { options });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedField(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedField && draggedField !== id) {
      setDragOverField(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverField(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedField || draggedField === targetId) {
      setDraggedField(null);
      setDragOverField(null);
      return;
    }

    const draggedIndex = fields.findIndex(field => field.id === draggedField);
    const targetIndex = fields.findIndex(field => field.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newFields = [...fields];
    const [removed] = newFields.splice(draggedIndex, 1);
    newFields.splice(targetIndex, 0, removed);

    onChange({ ...content, fields: newFields });
    setDraggedField(null);
    setDragOverField(null);
  };

  const handleDragEnd = () => {
    setDraggedField(null);
    setDragOverField(null);
  };

  return (
    <div className="space-y-4">
      {/* Form Settings Toggle */}
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-between h-8"
        onClick={() => setShowSettings(!showSettings)}
      >
        <span className="flex items-center gap-2">
          <Settings2 className="h-3 w-3" />
          Form Settings
        </span>
        <ChevronRight className={`h-4 w-4 transition-transform ${showSettings ? 'rotate-90' : ''}`} />
      </Button>

      {/* Form Settings */}
      {showSettings && (
        <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <Label className="text-xs">Submit Button Text</Label>
            <Input
              value={submitText}
              onChange={(e) => onChange({ ...content, submitText: e.target.value })}
              className="h-8"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Submit Action</Label>
            <Select
              value={submitAction}
              onValueChange={(v) => onChange({ ...content, submitAction: v as FormContent['submitAction'] })}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Send Email</SelectItem>
                <SelectItem value="webhook">Webhook URL</SelectItem>
                <SelectItem value="supabase">Save to Database</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {submitAction === 'email' && (
            <div className="space-y-2">
              <Label className="text-xs">Recipient Email</Label>
              <Input
                type="email"
                value={content.recipientEmail || ''}
                onChange={(e) => onChange({ ...content, recipientEmail: e.target.value })}
                placeholder="your@email.com"
                className="h-8"
              />
            </div>
          )}

          {submitAction === 'webhook' && (
            <div className="space-y-2">
              <Label className="text-xs">Webhook URL</Label>
              <Input
                type="url"
                value={content.webhookUrl || ''}
                onChange={(e) => onChange({ ...content, webhookUrl: e.target.value })}
                placeholder="https://..."
                className="h-8"
              />
            </div>
          )}

          {submitAction === 'supabase' && (
            <div className="space-y-2">
              <Label className="text-xs">Table Name</Label>
              <Input
                value={content.supabaseTable || ''}
                onChange={(e) => onChange({ ...content, supabaseTable: e.target.value })}
                placeholder="form_submissions"
                className="h-8"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs">Success Message</Label>
            <Textarea
              value={successMessage}
              onChange={(e) => onChange({ ...content, successMessage: e.target.value })}
              placeholder="Thank you for your submission!"
              className="min-h-[60px]"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">Show Field Labels</Label>
            <Switch
              checked={showLabels}
              onCheckedChange={(checked) => onChange({ ...content, showLabels: checked })}
            />
          </div>
        </div>
      )}

      {/* Add Field Buttons */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Quick Add Field</Label>
        <div className="flex flex-wrap gap-1">
          {FIELD_TYPES.slice(0, 5).map(type => (
            <Button
              key={type.value}
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => addField(type.value as FormField['type'])}
            >
              {type.label}
            </Button>
          ))}
          <Select
            value=""
            onValueChange={(v) => addField(v as FormField['type'])}
          >
            <SelectTrigger className="h-7 w-20 text-xs">
              <span>More...</span>
            </SelectTrigger>
            <SelectContent>
              {FIELD_TYPES.slice(5).map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fields List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Form Fields ({fields.length})</Label>
        </div>

        <p className="text-xs text-muted-foreground">
          Drag fields to reorder
        </p>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {fields.map((field, index) => (
            <div
              key={field.id}
              draggable
              onDragStart={(e) => handleDragStart(e, field.id)}
              onDragOver={(e) => handleDragOver(e, field.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, field.id)}
              onDragEnd={handleDragEnd}
              className={`border rounded-lg bg-background transition-all ${
                draggedField === field.id ? 'opacity-50' : ''
              } ${
                dragOverField === field.id ? 'border-primary border-2' : ''
              }`}
            >
              <div
                className="flex items-center gap-2 p-2 cursor-pointer hover:bg-muted/50"
                onClick={() => setExpandedField(expandedField === field.id ? null : field.id)}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{field.label}</span>
                    {field.required && (
                      <span className="text-xs text-destructive">*</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {FIELD_TYPES.find(t => t.value === field.type)?.label}
                    {field.width === 'half' && ' • Half width'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => { e.stopPropagation(); moveField(index, 'up'); }}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => { e.stopPropagation(); moveField(index, 'down'); }}
                    disabled={index === fields.length - 1}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {expandedField === field.id && (
                <div className="p-3 border-t space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label className="text-xs">Field Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={(v) => {
                          const updates: Partial<FormField> = { type: v as FormField['type'] };
                          if (['select', 'radio', 'checkbox'].includes(v) && !field.options) {
                            updates.options = ['Option 1', 'Option 2', 'Option 3'];
                          }
                          updateField(field.id, updates);
                        }}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FIELD_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Width</Label>
                      <Select
                        value={field.width || 'full'}
                        onValueChange={(v) => updateField(field.id, { width: v as 'full' | 'half' })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Full Width</SelectItem>
                          <SelectItem value="half">Half Width</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Label</Label>
                    <Input
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      className="h-8"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Placeholder</Label>
                    <Input
                      value={field.placeholder || ''}
                      onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                      placeholder="Enter placeholder text..."
                      className="h-8"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Required</Label>
                    <Switch
                      checked={field.required}
                      onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                    />
                  </div>

                  {/* Options for select, radio, checkbox */}
                  {['select', 'radio', 'checkbox'].includes(field.type) && (
                    <div className="space-y-2">
                      <Label className="text-xs">Options (one per line)</Label>
                      <Textarea
                        value={(field.options || []).join('\n')}
                        onChange={(e) => updateOptions(field.id, e.target.value)}
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                        className="min-h-[80px]"
                      />
                    </div>
                  )}

                  {/* Validation for text fields */}
                  {['text', 'email', 'tel', 'textarea'].includes(field.type) && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label className="text-xs">Min Length</Label>
                        <Input
                          type="number"
                          value={field.validation?.minLength || ''}
                          onChange={(e) => updateField(field.id, { 
                            validation: { ...field.validation, minLength: parseInt(e.target.value) || undefined }
                          })}
                          className="h-8"
                          min={0}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Max Length</Label>
                        <Input
                          type="number"
                          value={field.validation?.maxLength || ''}
                          onChange={(e) => updateField(field.id, { 
                            validation: { ...field.validation, maxLength: parseInt(e.target.value) || undefined }
                          })}
                          className="h-8"
                          min={0}
                        />
                      </div>
                    </div>
                  )}

                  {/* Validation for number fields */}
                  {field.type === 'number' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label className="text-xs">Min Value</Label>
                        <Input
                          type="number"
                          value={field.validation?.min ?? ''}
                          onChange={(e) => updateField(field.id, { 
                            validation: { ...field.validation, min: parseFloat(e.target.value) || undefined }
                          })}
                          className="h-8"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Max Value</Label>
                        <Input
                          type="number"
                          value={field.validation?.max ?? ''}
                          onChange={(e) => updateField(field.id, { 
                            validation: { ...field.validation, max: parseFloat(e.target.value) || undefined }
                          })}
                          className="h-8"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {fields.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
              No fields yet. Add fields using the buttons above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
