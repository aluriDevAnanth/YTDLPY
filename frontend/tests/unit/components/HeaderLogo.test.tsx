import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, it, expect } from "vitest";
import { HeaderLogo } from "src/pages/components/header/HeaderLogo";
import type { User } from "src/store/useAppStore";

const datasets: Array<{ user: User | null; shouldShowAdmin: boolean }> = [
  { user: null, shouldShowAdmin: false },
  { user: { id: "1", username: "alice", email: "a@x.com", role: "user" }, shouldShowAdmin: false },
  { user: { id: "2", username: "bob", email: "b@x.com", role: "admin" }, shouldShowAdmin: true },
  { user: { id: "3", username: "charlie", email: "c@x.com", role: "guest" }, shouldShowAdmin: false },
  { user: { id: "4", username: "root_admin", email: "root@x.com", role: "admin" }, shouldShowAdmin: true },
  { user: { id: "5", username: "dave", email: "d@x.com", role: "user" }, shouldShowAdmin: false },
  { user: { id: "6", username: "super_admin", email: "super@x.com", role: "admin" }, shouldShowAdmin: true },
  { user: { id: "7", username: "eve", email: "eve@x.com", role: "user" }, shouldShowAdmin: false },
  { user: { id: "8", username: "frank", email: "f@x.com", role: "moderator" }, shouldShowAdmin: false },
  { user: { id: "9", username: "admin_test", email: "at@x.com", role: "admin" }, shouldShowAdmin: true },
];

describe("HeaderLogo Unit Tests with 10 Datasets", () => {
  datasets.forEach(({ user, shouldShowAdmin }, index) => {
    it(`dataset #${index}: should render brand logo and admin tag accurately for user role '${user?.role}'`, () => {
      render(
        <MemoryRouter>
          <HeaderLogo user={user} />
        </MemoryRouter>
      );

      expect(screen.getByText("YTDLPY")).toBeInTheDocument();
      if (shouldShowAdmin) {
        expect(screen.getByText("ADMIN")).toBeInTheDocument();
      } else {
        expect(screen.queryByText("ADMIN")).not.toBeInTheDocument();
      }
    });
  });
});
