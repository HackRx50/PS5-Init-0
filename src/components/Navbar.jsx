import React from "react";
import {
  Box,
  Flex,
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
  Stack,
  useColorMode,
  Center,
  Text,
  IconButton,
  HStack,
  Link,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { MoonIcon, SunIcon, HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { useState } from "react";

const NavLink = ({ children, to }) => (
  <Link
    as={RouterLink}
    to={to}
    px={2}
    py={1}
    rounded={"md"}
    sx={{
      '&:hover': {
        textDecoration: "none",
        bg: useColorModeValue("blue.50", "blue.900"),
        color: useColorModeValue("blue.700", "blue.200"),
        transform: "translateY(-2px)",
        transition: "all 0.2s ease-in-out",
      }
    }}
  >
    {children}
  </Link>
);

function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <Box
      bg={useColorModeValue("white", "gray.900")}
      px={4}
      boxShadow="sm"
      position="fixed"
      width="100%"
      zIndex="1"
      top="0"
    >
      <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
        <IconButton
          size={"md"}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={"Open Menu"}
          display={{ md: "none" }}
          onClick={() => setIsOpen(!isOpen)}
        />
        <HStack spacing={8} alignItems={"center"}>
          <Box 
            fontWeight="bold" 
            fontSize="xl"
            sx={{
              '&:hover': {
                color: useColorModeValue("blue.500", "blue.300"),
                transition: "color 0.2s ease-in-out",
              }
            }}
          >
            init 0
          </Box>
          <HStack as={"nav"} spacing={4} display={{ base: "none", md: "flex" }}>
            <NavLink to="/adminDashboard">Dashboard</NavLink>
            <NavLink to="/">Admin Login</NavLink>
            <NavLink to="/signUp">Submit Claim</NavLink>
          </HStack>
        </HStack>
        <Flex alignItems={"center"}>
          <Stack direction={"row"} spacing={7}>
            <IconButton
              onClick={toggleColorMode}
              icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              aria-label={"Toggle Color Mode"}
              sx={{
                '&:hover': {
                  bg: useColorModeValue("blue.100", "blue.700"),
                  transform: "rotate(15deg)",
                  transition: "all 0.2s ease-in-out",
                }
              }}
            />

            <Menu>
              <MenuButton
                as={Button}
                rounded={"full"}
                variant={"link"}
                cursor={"pointer"}
                minW={0}
                sx={{
                  '&:hover': {
                    transform: "scale(1.05)",
                    transition: "all 0.2s ease-in-out",
                  }
                }}
              >
                <Avatar
                  size={"sm"}
                  src={"https://avatars.dicebear.com/api/male/username.svg"}
                />
              </MenuButton>
              <MenuList alignItems={"center"}>
                <br />
                <Center>
                  <Avatar
                    size={"2xl"}
                    src={"https://avatars.dicebear.com/api/male/username.svg"}
                  />
                </Center>
                <br />
                <Center>
                  <Text>Team init 0</Text>
                </Center>
                <br />
                <MenuDivider />
                <MenuItem
                  sx={{
                    '&:hover': {
                      bg: useColorModeValue("blue.50", "blue.900"),
                      color: useColorModeValue("blue.700", "blue.200"),
                    }
                  }}
                >
                  Account Settings
                </MenuItem>
                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    '&:hover': {
                      bg: useColorModeValue("red.50", "red.900"),
                      color: useColorModeValue("red.700", "red.200"),
                    }
                  }}
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </Stack>
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: "none" }}>
          <Stack as={"nav"} spacing={4}>
            <NavLink to="/adminDashboard">Dashboard</NavLink>
            <NavLink to="/">Admin Login</NavLink>
            <NavLink to="/signUp">Submit Claim</NavLink>
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
}

export default Navbar;
