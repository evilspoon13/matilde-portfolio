"use client";

import { RiSettingsLine, RiUserLine, RiLoginBoxLine, RiLogoutBoxLine } from "react-icons/ri";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "./ui/dialog";
import { useState } from "react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { GoogleTranslate } from "./GoogleTranslate";
import { Label } from "./ui/label";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Settings() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === "authenticated" && session;

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="relative w-12 h-12 rounded-full overflow-hidden cursor-pointer">
            {isAuthenticated && session.user?.image ? (
              <Image 
                src={session.user.image} 
                alt={session.user.name || "User profile"} 
                width={48} 
                height={48} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                <RiUserLine className="text-white w-6 h-6" />
              </div>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end">
          <DropdownMenuItem
            className="flex items-center justify-center gap-2"
            onSelect={(e) => e.preventDefault()}
          >
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <div className="flex items-center justify-center gap-2 w-full cursor-pointer">
                  <RiSettingsLine className="w-5 h-5 text-gray-400"/>
                  <span>Settings</span>
                </div>
              </DialogTrigger>
              <DialogContent 
                className="dialog-content" 
                style={{ zIndex: 9999 }}
              >
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-8 py-4">
                  <div className="items-center gap-4">
                    <Label className="mb-2">Language</Label>
                    <GoogleTranslate />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </DropdownMenuItem>
          
          {isAuthenticated ? (
            <DropdownMenuItem 
              className="flex items-center justify-center gap-2"
              onSelect={(e) => e.preventDefault()}
              onClick={handleLogout}
            >
              <div className="flex items-center justify-center gap-2 w-full cursor-pointer">
                <RiLogoutBoxLine className="w-5 h-5 text-gray-400"/>
                <span>Sign out</span>
              </div>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              className="flex items-center justify-center gap-2"
              onSelect={(e) => e.preventDefault()}
              onClick={handleLoginRedirect}
            >
              <div className="flex items-center justify-center gap-2 w-full cursor-pointer">
                <RiLoginBoxLine className="w-5 h-5 text-gray-400"/>
                <span>Sign in</span>
              </div>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}