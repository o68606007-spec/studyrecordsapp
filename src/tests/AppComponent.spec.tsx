import App from "../App";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { StudyRecord } from "../domain/GetTableDomain";

let mockData: any[] = [];

vi.mock("../lib/GetTableLib", () => ({
  GetAllRecords: vi.fn(() => Promise.resolve(mockData)),
}));

vi.mock("../utils/supabase", () => ({
  supabase: {
    from: () => ({
      insert: vi.fn(async (newData) => {
        mockData.push({
          id: String(mockData.length + 1),
          ...newData[0],
        });
        return { error: null };
      }),
      delete: () => ({
        eq: vi.fn(async (_key, id) => {
          mockData = mockData.filter((d) => d.id !== id);
          return { error: null };
        }),
      }),
      update: () => ({
        eq: vi.fn(async (_key, id) => {
          const target = mockData.find((d) => d.id === id);
          if (target) {
            Object.assign(target);
          }
          return { error: null };
        }),
      }),
      select: () => ({
        eq: () => ({
          single: vi.fn(async (_key, id) => {
            const data = mockData.find((d) => d.id === id);
            return { data, error: null };
          }),
        }),
      }),
    }),
  },
}));

vi.mock("@chakra-ui/react", async () => {
  const actual = await vi.importActual("@chakra-ui/react");
  return {
    ...actual,
    Portal: ({ children }: any) => children,
  };
});

beforeEach(() => {
  mockData = [
    { id: "1", studyContent: "記録1", studyTime: 4 },
    { id: "2", studyContent: "記録2", studyTime: 5 },
  ];
  vi.resetModules();
});

afterEach(() => {
  cleanup();
});

describe("App", () => {
  test("Loading", async () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <App />
      </ChakraProvider>
    );
    screen.findByTestId("loading");
    const loading = screen.getByTestId("loading");
    expect(loading).toBeInTheDocument();
  });

  test("TableList", async () => {
    const { default: App } = await import("../App");
    render(
      <ChakraProvider value={defaultSystem}>
        <App />
      </ChakraProvider>
    );
    await screen.findByTestId("tablelist");
    expect(screen.getByText("記録1")).toBeInTheDocument();
    expect(screen.getByText("記録2")).toBeInTheDocument();
    //getAllByTextは配列、その個数を調べる
    expect(screen.getAllByText("4")).toHaveLength(1);
    expect(screen.getAllByText("5")).toHaveLength(1);
  });

  test("Title", async () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <App />
      </ChakraProvider>
    );
    await screen.findByTestId("title");
    const title = screen.getByTestId("title");
    expect(title).toBeInTheDocument();
  });

  test("AddButton", async () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <App />
      </ChakraProvider>
    );
    await screen.findByTestId("addbutton");
    const addbutton = screen.getByTestId("addbutton");
    expect(addbutton).toBeInTheDocument();
  });

  test("AddButtonTitle", async () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <App />
      </ChakraProvider>
    );
    const user = userEvent.setup();
    await screen.findByTestId("addbutton");
    const openButton = await screen.getByTestId("addbutton");
    await user.click(openButton);
    expect(screen.getByText("新規学習記録")).toBeInTheDocument();
  });

  test("Add", async () => {

    const { default: App } = await import("../App");
    render(
      <ChakraProvider value={defaultSystem}>
        <App />
      </ChakraProvider>
    );
    const user = userEvent.setup();
    await screen.findByTestId("addbutton");
    const openButton = await screen.getByTestId("addbutton");
    await user.click(openButton);
    const contentInput = await screen.findByTestId("content-input");
    const timeInput = await screen.findByTestId("time-input"); 
    const button = screen.getByRole("button", { name: "登録" });
    await user.type(contentInput, "記録3");
    await user.type(timeInput, "4");
    await user.click(button);
    const updateItems = await screen.findAllByTestId("data-item");
    await waitFor(async () => {
      expect(await screen.findAllByTestId("data-item")).toHaveLength(3);
    });
  });

  test("学習内容がないときに登録するとエラー", async () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <App />
      </ChakraProvider>
    );
    const user = userEvent.setup();
    await screen.findByTestId("addbutton");
    const openButton = await screen.getByTestId("addbutton");
    await user.click(openButton);
    const contentInput = await screen.findByTestId("content-input");
    const timeInput = await screen.findByTestId("time-input"); 
    const button = screen.getByRole("button", { name: "登録" });
    await user.clear(contentInput);
    await user.type(timeInput, "4");
    await user.click(button);
    const updateItems = await screen.findAllByTestId("data-item");
    expect(await screen.findByTestId("studycontent-error")).toHaveTextContent("内容の入力は必須です");
  });

  test("学習時間がないときに登録するとエラー", async () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <App />
      </ChakraProvider>
    );
    const user = userEvent.setup();
    await screen.findByTestId("addbutton");
    const openButton = await screen.getByTestId("addbutton");
    await user.click(openButton);
    const contentInput = await screen.findByTestId("content-input");
    const timeInput = await screen.findByTestId("time-input"); 
    const button = screen.getByRole("button", { name: "登録" });
    await user.type(contentInput, "記録3");
    await user.clear(timeInput);
    await user.click(button);
    const updateItems = await screen.findAllByTestId("data-item");
    expect(await screen.findByTestId("studytime-error")).toHaveTextContent("時間の入力は必須です");
  });

  test("学習時間が0より少ない時に登録するとエラー", async () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <App />
      </ChakraProvider>
    );
    const user = userEvent.setup();
    await screen.findByTestId("addbutton");
    const openButton = await screen.getByTestId("addbutton");
    await user.click(openButton);
    const contentInput = await screen.findByTestId("content-input");
    const timeInput = await screen.findByTestId("time-input"); 
    const button = screen.getByRole("button", { name: "登録" });
    await user.type(contentInput, "記録3");
    await user.clear(timeInput);
    await user.type(timeInput, '-1');
    await user.click(button);
    expect(await screen.findByTestId("studytime-error")).toHaveTextContent("時間は0以上である必要があります");
  });

  test("DeleteButton", async () => {

    const { default: App } = await import("../App");
    render(
      <ChakraProvider value={defaultSystem}>
        <App />
      </ChakraProvider>
    );
    const initialItems = (await screen.findAllByTestId("data-item")).length;
    const user = userEvent.setup();
    await screen.findAllByTestId("deletebutton");
    const deletebutton = await screen.getAllByTestId("deletebutton");
    await user.click(deletebutton[0]);
    const updateItems = await screen.findAllByTestId("data-item");
    await waitFor(async () => {
      expect(await screen.findAllByTestId("data-item")).toHaveLength(1);
    });
  });
  test("UpdateButtonTitle", async () => {

    const { default: App } = await import("../App");
    render(
      <ChakraProvider value={defaultSystem}>
        <App />
      </ChakraProvider>
    );
    const user = userEvent.setup();
    await screen.findAllByTestId("updatebutton");
    const updateButton = await screen.findAllByTestId("updatebutton");
    await user.click(updateButton[0]);
    screen.debug()
    await waitFor(() => {
      expect(screen.getByTestId("add-title")).toBeInTheDocument();
      });
  });

  test("Update", async () => {

    const { default: App } = await import("../App");
    render(
      <ChakraProvider value={defaultSystem}>
        <App />
      </ChakraProvider>
    );
    const user = userEvent.setup();
    await screen.findAllByTestId("updatebutton");
    const updateButton = await screen.findAllByTestId("updatebutton");
    await user.click(updateButton[0]);
    const contentInput = await screen.findByTestId("content-input");
    const timeInput = await screen.findByTestId("time-input"); 
    const button = await screen.getByRole("button", { name: "登録" });
    await user.type(contentInput, "記録10");
    await user.type(timeInput, "9");
    await user.click(button);
    await waitFor(async () => {
      expect(await screen.getByText("記録10")).toBeInTheDocument();
      expect(await screen.getByText("9")).toBeInTheDocument();
    });
  });
}); 