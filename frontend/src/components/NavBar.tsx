"use client";

import Image from "next/image";
import Link from "next/link";
import { 
    NavigationMenu,
    NavigationMenuItem,
    navigationMenuTriggerStyle,
    NavigationMenuLink,
    NavigationMenuList
} from "./ui/navigation-menu";
import Settings from "./Settings";
import { GoogleTranslate } from "./GoogleTranslate";


export default function NavBar(){

    return (
        <div className="flex items-center justify-between px-16">
            <div className="flex items-center gap-6">
                <Link href="/">
                    <Image
                        src="/peldem-logo.webp"
                        alt="Peldem Logo"
                        width={125}
                        height={125}
                    />
                </Link>
            </div>
            <div className="flex gap-6 items-center">
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <Link href="/" legacyBehavior passHref>
                                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                    Home
                                </NavigationMenuLink>
                            </Link>
                            <Link href="/about" legacyBehavior passHref>
                                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                    About
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
                <Settings />
                    <div className="hidden">
                    <GoogleTranslate />
                </div>
            </div>
        </div>
    );
}