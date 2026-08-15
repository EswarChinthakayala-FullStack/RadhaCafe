import * as React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
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
  DropletIcon,
  Wallet01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"
import { useAuth } from "../hooks/useAuth"
import { useAdminReviewSummary } from "../hooks/useDiscussions"

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
    title: "Overview",
    items: [
      { title: "Dashboard", url: ROUTES.ADMIN.DASHBOARD, icon: DashboardSquare01Icon },
    ],
  },
  {
    title: "RadhaCafe",
    items: [
      { title: "New Cafe Order", url: ROUTES.ADMIN.NEW_ORDER, icon: PlusSignIcon },
      { title: "Cafe Orders", url: ROUTES.ADMIN.ORDERS, icon: InvoiceIcon },
      { title: "Cafe Menu", url: ROUTES.ADMIN.MENU, icon: Menu01Icon },
      { title: "Cafe Customers", url: ROUTES.ADMIN.CUSTOMERS, icon: UserGroupIcon },
    ],
  },
  {
    title: "RadhaWater",
    items: [
      { title: "Water Dashboard", url: ROUTES.ADMIN.WATER.DASHBOARD, icon: DashboardSquare01Icon },
      { title: "New Water Order", url: ROUTES.ADMIN.WATER.NEW_ORDER, icon: PlusSignIcon },
      { title: "Water Orders", url: ROUTES.ADMIN.WATER.ORDERS, icon: InvoiceIcon },
      { title: "Water Products", url: ROUTES.ADMIN.WATER.PRODUCTS, icon: DropletIcon },
      { title: "Water Customers", url: ROUTES.ADMIN.WATER.CUSTOMERS, icon: UserGroupIcon },
      { title: "Water Payments", url: ROUTES.ADMIN.WATER.PAYMENTS, icon: Wallet01Icon },
      { title: "Water Events", url: ROUTES.ADMIN.WATER.EVENTS, icon: SparklesIcon },
      { title: "Water Analytics", url: ROUTES.ADMIN.WATER.ANALYTICS, icon: Analytics01Icon },
    ],
  },
  {
    title: "Content",
    items: [
      { title: "Gallery", url: ROUTES.ADMIN.GALLERY, icon: Image01Icon },
      { title: "Reviews", url: ROUTES.ADMIN.DISCUSSIONS, icon: Comment01Icon },
    ],
  },
  {
    title: "System",
    items: [
      { title: "Cafe Analytics", url: ROUTES.ADMIN.ANALYTICS, icon: Analytics01Icon },
      { title: "Printer", url: ROUTES.ADMIN.PRINTER, icon: PrinterIcon },
      { title: "Receipt Templates", url: "/admin/settings/receipts", icon: InvoiceIcon },
      { title: "Settings", url: ROUTES.ADMIN.SETTINGS, icon: Settings01Icon },
    ],
  },
]

export const allNavItems: NavItem[] = navGroups.flatMap((g) => g.items)

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { isMobile, setOpenMobile } = useSidebar()

  const { data: reviewSummary } = useAdminReviewSummary()
  const pendingReviewsCount = reviewSummary?.pending_count || 0

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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border" {...props}>
      <SidebarHeader className="h-14 border-b border-sidebar-border px-2 flex items-center justify-start shrink-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
        <Link to={ROUTES.ADMIN.DASHBOARD} className="flex items-center gap-3 px-3 py-2 overflow-hidden w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <div className="w-8 h-8 shrink-0 flex items-center justify-center">
            <RadhaCafeLogo />
          </div>
          <span className="font-heading font-bold text-sm text-sidebar-foreground truncate group-data-[collapsible=icon]:hidden">
            Radha<span className="text-cinnamon">Cafe</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4 space-y-4 no-scrollbar">
        {navGroups.map((group, groupIdx) => (
          <SidebarGroup key={group.title} className="p-0">
            <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/60 mb-1 group-data-[collapsible=icon]:hidden">
              {group.title}
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive = (() => {
                  if (location.pathname === item.url) return true
                  const hasExactMatch = allNavItems.some((nav) => nav.url === location.pathname)
                  if (hasExactMatch) return false
                  if (item.url !== "/admin/dashboard" && item.url !== "/admin/water") {
                    return location.pathname.startsWith(item.url + "/")
                  }
                  return false
                })()
                const isReviewsItem = item.url === ROUTES.ADMIN.DISCUSSIONS
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      render={
                        <Link
                          to={item.url}
                          state={item.url === ROUTES.ADMIN.SETTINGS ? {
                            from: `${location.pathname}${location.search}`,
                          } : undefined}
                          onClick={handleNavClick}
                          className={
                            isActive
                              ? "bg-cinnamon text-white font-bold hover:bg-cinnamon/90 transition-all rounded-md shadow-2xs flex items-center justify-between px-3 py-2 text-xs"
                              : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all rounded-md flex items-center justify-between px-3 py-2 text-xs"
                          }
                        />
                      }
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <HugeiconsIcon icon={item.icon} size={16} className="shrink-0" />
                        <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </div>
                      {isReviewsItem && pendingReviewsCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white group-data-[collapsible=icon]:hidden shrink-0">
                          {pendingReviewsCount}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
            {groupIdx < navGroups.length - 1 && <SidebarSeparator className="my-3 opacity-40 group-data-[collapsible=icon]:hidden" />}
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              tooltip="Sign Out"
              className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive text-xs font-semibold rounded-md flex items-center gap-3 px-3 py-2 transition-all"
            >
              <HugeiconsIcon icon={Logout01Icon} size={16} className="shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
