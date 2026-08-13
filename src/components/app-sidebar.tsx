import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { ROUTES } from "../constants/routes"
import { RadhaCafeLogo } from "./brand/AppLogo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSquare01Icon,
  PlusSignIcon,
  InvoiceIcon,
  UserGroupIcon,
  Menu01Icon,
  Image01Icon,
  Comment01Icon,
  Analytics01Icon,
  PrinterIcon,
  Settings01Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons"
import { useAuth } from "../hooks/useAuth"
import { useNavigate } from "react-router-dom"

interface NavItem {
  title: string
  url: string
  icon: any
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    title: "POS & Operations",
    items: [
      { title: "Dashboard", url: ROUTES.ADMIN.DASHBOARD, icon: DashboardSquare01Icon },
      { title: "New Order", url: ROUTES.ADMIN.NEW_ORDER, icon: PlusSignIcon },
      { title: "Order History", url: ROUTES.ADMIN.ORDERS, icon: InvoiceIcon },
      { title: "Customers", url: ROUTES.ADMIN.CUSTOMERS, icon: UserGroupIcon },
    ],
  },
  {
    title: "Menu & Content",
    items: [
      { title: "Menu Items", url: ROUTES.ADMIN.MENU, icon: Menu01Icon },
      { title: "Gallery", url: ROUTES.ADMIN.GALLERY, icon: Image01Icon },
      { title: "Reviews", url: ROUTES.ADMIN.DISCUSSIONS, icon: Comment01Icon },
    ],
  },
  {
    title: "System",
    items: [
      { title: "Analytics", url: ROUTES.ADMIN.ANALYTICS, icon: Analytics01Icon },
      { title: "Printer", url: ROUTES.ADMIN.PRINTER, icon: PrinterIcon },
      { title: "Settings", url: ROUTES.ADMIN.SETTINGS, icon: Settings01Icon },
    ],
  },
]

// Flatten for external lookup
export const allNavItems: NavItem[] = navGroups.flatMap((g) => g.items)

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { isMobile, setOpenMobile } = useSidebar()

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const handleSignOut = async () => {
    if (isMobile) {
      setOpenMobile(false)
    }
    try {
      await logout()
      navigate(ROUTES.PUBLIC.LOGIN, { replace: true })
    } catch (err) {
      console.error("Sign out error:", err)
    }
  }

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
      {...props}
    >
      {/* ── Header: h-14 (matches topnav AdminHeader h-14) ── */}
      <SidebarHeader className="h-14 flex items-center justify-center px-3 group-data-[collapsible=icon]:px-0 shrink-0">
        <SidebarMenu className="group-data-[collapsible=icon]:items-center">
          <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full">
            <SidebarMenuButton
              size="lg"
              onClick={handleNavClick}
              className="h-10 hover:bg-transparent active:bg-transparent data-active:bg-transparent p-0 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center [&_svg]:size-9 group-data-[collapsible=icon]:[&_svg]:!size-7 group-data-[collapsible=icon]:[&_svg]:!w-7 group-data-[collapsible=icon]:[&_svg]:!h-7"
              render={<Link to={ROUTES.ADMIN.DASHBOARD} onClick={handleNavClick} />}
            >
              <RadhaCafeLogo className="size-9 group-data-[collapsible=icon]:!size-7 group-data-[collapsible=icon]:!w-7 group-data-[collapsible=icon]:!h-7 shrink-0 drop-shadow-md" />
              <div className="flex flex-col leading-none ml-2.5 group-data-[collapsible=icon]:hidden">
                <span className="font-heading font-bold text-xl text-cream tracking-tight">
                  Radha<span className="text-cinnamon">Cafe</span>
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator className="mx-0 bg-sidebar-border" />

      {/* ── Navigation ── */}
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-[10px] font-bold text-cream/50 uppercase tracking-widest">
              {group.title}
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive = location.pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      onClick={handleNavClick}
                      className={
                        isActive
                          ? "bg-cinnamon text-white font-semibold shadow-sm"
                          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-medium text-cream/85"
                      }
                      render={<Link to={item.url} onClick={handleNavClick} />}
                    >
                      <HugeiconsIcon
                        icon={item.icon}
                        size={16}
                        className={isActive ? "text-white" : "text-amber-200/70"}
                      />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* ── Footer: Sign-out ── */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign Out"
              className="text-red-300/80 hover:bg-red-900/30 hover:text-red-200 font-medium"
              onClick={handleSignOut}
            >
              <HugeiconsIcon icon={Logout01Icon} size={16} />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
