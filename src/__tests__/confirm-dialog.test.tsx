import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ConfirmDialog } from "@/components/confirm-dialog";

afterEach(() => cleanup());

describe("ConfirmDialog", () => {
  it("renders title and description when open", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Delete Food"
        description="Are you sure you want to delete Oats?"
        onConfirm={() => {}}
      />
    );
    expect(screen.getByText("Delete Food")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to delete Oats?")
    ).toBeInTheDocument();
  });

  it("renders cancel and confirm buttons when open", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Delete Food"
        description="Are you sure?"
        onConfirm={() => {}}
        confirmLabel="Delete"
      />
    );
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button is clicked", () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Confirm Action"
        description="Are you sure?"
        onConfirm={onConfirm}
        confirmLabel="Yes, delete"
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Yes, delete" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onOpenChange(false) when cancel is clicked", () => {
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        title="Delete Food"
        description="Are you sure?"
        onConfirm={() => {}}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("uses custom confirm label", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Remove Entry"
        description="Remove this?"
        onConfirm={() => {}}
        confirmLabel="Remove"
      />
    );
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
  });

  it("defaults confirm label to Delete", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Confirm"
        description="Sure?"
        onConfirm={() => {}}
      />
    );
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });
});
