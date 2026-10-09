import { useState } from 'react';
import { Button } from '../../src/compat/button';
import { Input } from '../../src/compat/input';
import { Textarea } from '../../src/compat/textarea';
import { Checkbox } from '../../src/compat/checkbox';
import { Switch } from '../../src/compat/switch';
import { SelectControl } from '../../src/compat/select';
import { SegmentedControl } from '../../src/compat/segmented-control';
import {
  AppDialog,
  AppDialogContent,
  AppDialogHeader,
  AppDialogTitle,
  AppDialogDescription,
  AppDialogBody,
  AppDialogFooter,
} from '../../src/compat/app-dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../../src/compat/dropdown-menu';
import { Popover, PopoverTrigger, PopoverContent } from '../../src/compat/popover';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../src/compat/card';
import { Avatar, AvatarFallback } from '../../src/compat/avatar';
import { Badge } from '../../src/compat/badge';
import { Label } from '../../src/compat/label';
import { Progress } from '../../src/compat/progress';
import { Separator } from '../../src/compat/separator';
import { Skeleton } from '../../src/compat/skeleton';
import { DatePicker } from '../../src/compat/date-picker';
import { LoadingSpinner } from '../../src/compat/loading-spinner';
import { InternalScrollArea } from '../../src/compat/internal-scroll-area';

export function CompatExamples() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('design');
  const [checked, setChecked] = useState(true);
  const [date, setDate] = useState<Date>();
  return (
    <div className="reference-fields">
      <div className="reference-row">
        <Button actionId="reference.compat.dialog" onClick={() => setOpen(true)}>
          Edit project
        </Button>
        <Button asChild>
          <a href="../">Client replica</a>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button actionId="reference.compat.actions">Actions</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem actionId="reference.compat.rename" onSelect={() => setOpen(true)}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Archive</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Popover>
          <PopoverTrigger asChild>
            <Button actionId="reference.compat.details">Details</Button>
          </PopoverTrigger>
          <PopoverContent>Release checklist</PopoverContent>
        </Popover>
      </div>
      <Label htmlFor="compat-project">Project name</Label>
      <Input id="compat-project" defaultValue="Design system" />
      <Textarea aria-label="Project notes" placeholder="Notes" />
      <SelectControl
        actionId="reference.compat.select"
        aria-label="Owner"
        value={value}
        onValueChange={setValue}
        options={[
          { value: 'design', label: 'Design' },
          { value: 'release', label: 'Release' },
        ]}
      />
      <SegmentedControl
        ariaLabel="Project view"
        actionId="reference.compat.view"
        value={value}
        onValueChange={setValue}
        items={[
          { value: 'design', label: 'Design' },
          { value: 'release', label: 'Release' },
        ]}
      />
      <div className="reference-row">
        <Checkbox
          aria-label="Include completed"
          checked={checked}
          onCheckedChange={(next) => setChecked(next === true)}
        />
        <Switch aria-label="Allow notifications" checked={checked} onCheckedChange={setChecked} />
        <DatePicker value={date} onChange={setDate} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Release planning</CardTitle>
          <CardDescription>Ready for review</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={68} aria-label="Release completion" />
          <Separator />
          <InternalScrollArea>
            <span>Checklist complete</span>
          </InternalScrollArea>
        </CardContent>
        <CardFooter>
          <Avatar>
            <AvatarFallback>OR</AvatarFallback>
          </Avatar>
          <Badge>In review</Badge>
        </CardFooter>
      </Card>
      <Skeleton className="reference-skeleton" />
      <LoadingSpinner />
      <AppDialog open={open} onOpenChange={setOpen}>
        <AppDialogContent>
          <AppDialogHeader>
            <AppDialogTitle>Edit project</AppDialogTitle>
            <AppDialogDescription>Update the project name.</AppDialogDescription>
          </AppDialogHeader>
          <AppDialogBody>
            <Input aria-label="Dialog project" defaultValue="Design system" />
          </AppDialogBody>
          <AppDialogFooter>
            <Button actionId="reference.compat.save" onClick={() => setOpen(false)}>
              Save
            </Button>
          </AppDialogFooter>
        </AppDialogContent>
      </AppDialog>
    </div>
  );
}
