import { StepFlowPreview } from "./step-flow-preview";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, InputField, Toaster, toast } from "@soe/ui";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@soe/ui/primitives/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@soe/ui/primitives/dropdown-menu";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@soe/ui/primitives/accordion";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@soe/ui/primitives/tabs";
import { Switch } from "@soe/ui/primitives/switch";
import { Checkbox } from "@soe/ui/primitives/checkbox";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@soe/ui/primitives/tooltip";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@soe/ui/primitives/sheet";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@soe/ui/primitives/navigation-menu";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandItem,
} from "@soe/ui/primitives/command";
import "./preview.css";

function Preview() {
  const [commandsOpen, setCommandsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  return (
    <TooltipProvider>
      <main id="example" className="mx-auto grid max-w-xl gap-6 p-6">
        <h1 className="text-2xl font-semibold">Componentes SOE</h1>
        <InputField
          label="Nome de demonstração"
          description="Dado sintético para teste."
          value={name}
          error={error}
          onChange={(event) => {
            setName(event.target.value);
            if (event.target.value) setError("");
          }}
          onBlur={() => {
            if (!name) setError("Informe um nome.");
          }}
        />
        <Button loading={loading} onClick={() => setLoading(true)}>
          Salvar exemplo
        </Button>
        <Button variant="outline" onClick={() => setLoading(false)}>
          Finalizar exemplo
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Abrir diálogo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Diálogo de teste</DialogTitle>
            <DialogDescription>
              Confirme o foco e o fechamento.
            </DialogDescription>
            <DialogClose asChild>
              <Button>Fechar diálogo</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>Abrir menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onSelect={() => toast.success("Opção selecionada")}
            >
              Selecionar opção
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <StepFlowPreview />
        <h2 className="text-xl font-semibold">Interações</h2>
        <Accordion type="single" collapsible>
          <AccordionItem value="item">
            <AccordionTrigger>Detalhes do componente</AccordionTrigger>
            <AccordionContent>Conteúdo do accordion.</AccordionContent>
          </AccordionItem>
        </Accordion>
        <Tabs defaultValue="one">
          <TabsList>
            <TabsTrigger value="one">Primeira aba</TabsTrigger>
            <TabsTrigger value="two">Segunda aba</TabsTrigger>
          </TabsList>
          <TabsContent value="one">Primeiro painel.</TabsContent>
          <TabsContent value="two">Segundo painel.</TabsContent>
        </Tabs>
        <label className="flex items-center gap-3">
          <Switch />
          Ativar exemplo
        </label>
        <label className="flex items-center gap-3">
          <Checkbox />
          Marcar exemplo
        </label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Ajuda do exemplo</Button>
          </TooltipTrigger>
          <TooltipContent>Texto da ajuda</TooltipContent>
        </Tooltip>
        <Sheet>
          <SheetTrigger asChild>
            <Button>Abrir painel</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetTitle>Painel de teste</SheetTitle>
            <SheetDescription>Conteúdo do painel.</SheetDescription>
          </SheetContent>
        </Sheet>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Navegação de teste</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="#example">
                  Destino de teste
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Button onClick={() => setCommandsOpen(true)}>Abrir comandos</Button>
        <CommandDialog
          open={commandsOpen}
          onOpenChange={setCommandsOpen}
          title="Comandos de teste"
          description="Escolha uma ação do exemplo."
        >
          <CommandInput placeholder="Buscar comando" />
          <CommandList>
            <CommandItem>Executar exemplo</CommandItem>
          </CommandList>
        </CommandDialog>
      </main>
      <Toaster />
    </TooltipProvider>
  );
}
const root = document.getElementById("root");
if (root) {
  const app = createRoot(root);
  app.render(<Preview />);
  import.meta.hot?.dispose(() => app.unmount());
}
