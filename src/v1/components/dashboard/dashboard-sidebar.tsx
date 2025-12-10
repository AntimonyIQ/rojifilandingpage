import type React from "react";
import { useState, useEffect } from "react";
import {
  BarChart3,
  ArrowLeftRight,
  Settings,
  LogOut,
  X,
  CreditCard,
  Coins,
  Group,
  ReceiptText,
  Briefcase,
  LucideSend,
  Star,
} from "lucide-react";
import { Logo } from "@/v1/components/logo";
import { Button } from "../ui/button";
import { ISender, ITeamMember, IUser } from "@/v1/interface/interface";
import { session, SessionData } from "@/v1/session/session";
import { Badge } from "../ui/badge";
import { useLocation, useParams } from "wouter";
import { SenderStatus, TeamRole, UserType } from "@/v1/enums/enums";

interface DashboardSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const navigationBase = [
  { name: "Overview", href: "", icon: BarChart3, dashboard: true },
  {
    name: "Transactions",
    href: "transactions",
    icon: ArrowLeftRight,
    dashboard: true,
  },
  { name: "Beneficiary", href: "beneficiary", icon: Star, dashboard: true },
  {
    name: "Business Profile",
    href: "businessprofile",
    icon: Briefcase,
    dashboard: true,
  },
  { name: "Teams", href: "teams", icon: Group, dashboard: true },
  // { name: "Sender", href: "sender", icon: LucideSend, dashboard: true },
  { name: "OTC Desk", href: "otc", icon: Coins, dashboard: true },
  {
    name: "Virtual USD Cards",
    href: "virtualcard",
    icon: CreditCard,
    dashboard: true,
  },
  {
    name: "Bank Statement",
    href: "statement",
    icon: ReceiptText,
    dashboard: true,
  },
  { name: "Settings", href: "settings", icon: Settings, dashboard: true },
];

interface SendersProps extends DashboardSidebarProps {
  allSenders: Record<SenderStatus, number>;
}

export const DashboardSidebar: React.FC<SendersProps> = ({
  open,
  setOpen,
  allSenders,
}) => {
  const [location, navigate] = useLocation();
  const [user, setUser] = useState<IUser | null>(null);
  const [sender, setSender] = useState<ISender | null>(null);
  const [member, setMember] = useState<ITeamMember | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const sd: SessionData = session.getUserData();
  const { wallet } = useParams();

  useEffect(() => {
    if (sd && sd.user) {
      setUser(sd.user);
    }
    if (sd && sd.sender) {
      setSender(sd.sender);
    }
    if (sd && sd.member && sd.user.userType === UserType.TEAM_MEMBER) {
      setMember(sd.member);
    }
  }, []);

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    setShowLogoutDialog(false);
    session.logout();
    navigate("/login");
  };

  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl border">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <LogOut className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
              Confirm Logout
            </h3>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Are you sure you want to log out of your account? You'll need to
              sign in again to access your dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={cancelLogout}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Logo Header */}
        <div className="px-6 border-b border-gray-200 h-[73px] flex items-center justify-between">
          <a href="/dashboard/NGN">
            <Logo className="h-8 w-auto" />
          </a>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div>
          <nav className="flex-1 px-4 pt-6">
            <ul className="space-y-2">
              <li>
                <Button
                  variant="outline"
                  role="combobox"
                  size="md"
                  className="w-full justify-between"
                >
                  <div className="flex flex-row items-center gap-2">
                    {sender?.businessName}
                  </div>
                </Button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6 py-6">
          <ul className="space-y-2">
            {navigationBase
              .filter((item) => {
                // If user is a team member with SUPPORT role, only show Overview and Transactions
                if (member && member.role === TeamRole.SUPPORT) {
                  return (
                    item.name === "Overview" || item.name === "Transactions"
                  );
                }
                // For all other users, show all navigation items
                return true;
              })
              .map(
                (item: {
                  name: string;
                  href: string;
                  icon: any;
                  dashboard: boolean;
                }) => {
                  let href;
                  if (item.dashboard) {
                    if (item.name === "Overview") {
                      href = `/dashboard/${wallet}`;
                    } else {
                      href = `/dashboard/${wallet}${
                        item.href ? `/${item.href}` : ""
                      }`;
                    }
                  } else {
                    href = item.href;
                  }
                  // Use the current location (full path) to determine active state
                  const isActive =
                    item.name === "Overview"
                      ? location === href
                      : location === href || location?.startsWith(href + "/");
                  return (
                    <li key={item.name}>
                      <a
                        href={href}
                        onClick={(e) => {
                          e.preventDefault();
                          setOpen(false);
                          navigate(href);
                        }}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-blue-50 text-primary border-l-4 border-primary"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex flex-row items-center justify-between w-full">
                          <div className="flex flex-row items-center gap-2">
                            <item.icon className="h-5 w-5" />
                            {item.name}
                          </div>
                          {item.name === "Sender" &&
                            sender?.businessVerificationCompleted === false &&
                            allSenders[SenderStatus.UNAPPROVED] !== 0 && (
                              <Badge
                                variant="destructive"
                                className="text-white"
                              >
                                {allSenders[SenderStatus.UNAPPROVED] ?? 0}
                              </Badge>
                            )}
                        </div>
                      </a>
                    </li>
                  );
                }
              )}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-200 p-4">
          {user ? (
            <div className="flex items-center gap-3 mb-3">
              <img
                src={
                  user.imageURL
                    ? user.imageURL
                    : `https://api.dicebear.com/9.x/initials/svg?seed=${user.fullName}`
                }
                alt={user.fullName}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user.fullName}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user.email}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No user data</div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};
