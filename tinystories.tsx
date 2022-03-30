import Dialog from "@reach/dialog";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@reach/disclosure";
import React, { JSXElementConstructor, useState } from "react";
import "./styles.css";

type Story = JSXElementConstructor<any>;

type FolderContent = (string | Folder)[];

type Folder = {
  name: string;
  content: FolderContent;
};

function storiesToFolderStructure(stories: { [key: string]: Story }) {
  function recursiveUnpack(
    stories: { [key: string]: Story },
    name: string = ""
  ): Folder {
    const this_folder: Folder = {
      name,
      content: [],
    };
    const subfolders: { [folder: string]: { [key: string]: Story } } = {};

    // Sort stories by folder in substories
    for (const key in stories) {
      let parts = key.split("/");
      if (parts.length === 1) {
        this_folder.content.push(key);
      } else {
        const substory = {
          [parts.slice(1).join("/")]: stories[key],
        };

        if (subfolders[parts[0]] == null) {
          subfolders[parts[0]] = substory;
        } else {
          subfolders[parts[0]] = { ...subfolders[parts[0]], ...substory };
        }
      }
    }

    for (const key in subfolders) {
      this_folder.content.push(recursiveUnpack(subfolders[key], key));
    }

    return this_folder;
  }

  return recursiveUnpack(stories);
}

function FolderComponent({
  content,
  route = [],
  onSelect,
  collapseLevel,
}: {
  content: FolderContent;
  route?: string[];
  onSelect: (key: string) => void;
  collapseLevel: number;
}) {
  const [open, setOpen] = useState(collapseLevel <= 0 ? false : true);
  return (
    <div
      className="stories-folder"
      style={{
        borderLeft: route.length === 0 ? "none" : "",
        margin: route.length === 1 ? "6px 0 6px 0" : "",
      }}
    >
      <Disclosure open={open}>
        {route.length > 0 && (
          <DisclosureButton
            className="stories-folder-title"
            onClick={() => setOpen((old) => !old)}
          >
            <div>🗂 {route.slice(-1)[0].trim()}</div>
            <div style={{ color: "grey" }}>{open ? "▲" : "▼"}</div>
          </DisclosureButton>
        )}
        <DisclosurePanel>
          <div className="stories-folder-content">
            {content.map((item, index) => {
              if (typeof item === "string") {
                return (
                  <a
                    key={index}
                    onClick={() => onSelect([...route, item].join("/"))}
                    className="stories-menu-item"
                  >
                    📷 {item}
                  </a>
                );
              } else {
                return (
                  <FolderComponent
                    key={index}
                    content={item.content}
                    route={[...route, item.name]}
                    onSelect={onSelect}
                    collapseLevel={collapseLevel - 1}
                  />
                );
              }
            })}
          </div>
        </DisclosurePanel>
      </Disclosure>
    </div>
  );
}

export function Stories({
  stories,
  storyKey,
  setStoryKey,
  collapseLevel = 2,
}: {
  stories: { [key: string]: Story };
  storyKey: string;
  setStoryKey: (key: string) => void;
  collapseLevel?: number;
}) {
  const [modal, setModal] = useState(false);
  const { content } = storiesToFolderStructure(stories);

  const storiesMenu = (
    <StoriesMenu
      content={content}
      onSelect={(nextKey) => {
        setStoryKey(nextKey);
        setModal(false);
      }}
      collapseLevel={collapseLevel}
    />
  );
  const Story = storyKey && stories[storyKey];

  return (
    <>
      {Story ? <Story /> : storiesMenu}
      {Story && (
        <button className="stories-menu-button" onClick={() => setModal(true)}>
          Stories
        </button>
      )}
      <Dialog
        isOpen={modal}
        onDismiss={() => setModal(false)}
        aria-label="Stories"
        className="stories-dialog"
      >
        {storiesMenu}
      </Dialog>
    </>
  );
}

function StoriesMenu({
  content,
  onSelect,
  collapseLevel,
}: {
  content: FolderContent;
  onSelect: (key: string) => void;
  collapseLevel: number;
}) {
  return (
    <div className="stories-menu">
      <h1 style={{ marginBottom: 12 }}>Stories ✨</h1>
      <FolderComponent
        content={content}
        onSelect={onSelect}
        collapseLevel={collapseLevel}
      />
    </div>
  );
}
