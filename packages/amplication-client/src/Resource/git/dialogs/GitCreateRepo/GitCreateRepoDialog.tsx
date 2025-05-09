import {
  Button,
  CircularProgress,
  EnumFlexDirection,
  EnumGapSize,
  EnumTextColor,
  EnumTextStyle,
  FlexItem,
  HorizontalRule,
  Label,
  Text,
  TextInput,
  Toggle,
} from "@amplication/ui/design-system";
import { ApolloError, useQuery } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import { EnumGitOrganizationType, GitGroup } from "../../../../models";
import { formatError } from "../../../../util/error";
import { getGitRepositoryDetails } from "../../../../util/git-repository-details";
import { GitOrganizationFromGitRepository } from "../../ResourceGitSettingsPage";
import { GET_GROUPS } from "../../queries/gitProvider";
import { GitSelectGroup } from "../../select/GitSelectGroup";
import { GitRepositoryCreatedData } from "../GitRepos/GithubRepos";
import "./GitCreateRepo.scss";
import { GIT_REPO_CREATION_MESSAGE, GIT_REPO_NAME_RULES } from "./constants";

type createRepositoryInput = {
  repoName: string;
  isPublic: boolean;
  groupName?: string;
};
type Props = {
  gitOrganization: GitOrganizationFromGitRepository;
  repoCreated: {
    isRepoCreateLoading: boolean;
    RepoCreatedError: ApolloError;
  };
  onCreateGitRepository: (data: GitRepositoryCreatedData) => void;
};

const CLASS_NAME = "git-create-repo";

export default function GitCreateRepoDialog({
  gitOrganization,
  repoCreated,
  onCreateGitRepository,
}: Props) {
  const [createRepositoryInput, setCreateRepositoryInput] =
    useState<createRepositoryInput>({
      repoName: "",
      groupName: "",
      isPublic: false,
    });
  const [gitRepositoryUrl, setGitRepositoryUrl] = useState<string>("");

  const { data: gitGroupsData, loading: loadingGroups } = useQuery(GET_GROUPS, {
    variables: {
      organizationId: gitOrganization.id,
    },
    skip: !gitOrganization.useGroupingForRepositories,
  });

  const gitGroups = gitGroupsData?.gitGroups?.groups;
  const [repositoryGroup, setRepositoryGroup] = useState<GitGroup>(null);
  useEffect(() => {
    if (!repositoryGroup && gitGroups && gitGroups.length > 0) {
      setRepositoryGroup(gitGroups[0]);
      setCreateRepositoryInput({
        ...createRepositoryInput,
        groupName: gitGroups[0].name,
      });
    }
  }, [
    gitGroups,
    createRepositoryInput,
    setCreateRepositoryInput,
    repositoryGroup,
  ]);

  const handleSelectGroup = useCallback(
    (gitGroup) => {
      setRepositoryGroup(gitGroup);
      setCreateRepositoryInput({
        ...createRepositoryInput,
        groupName: gitGroup.name,
      });
    },
    [createRepositoryInput, setCreateRepositoryInput]
  );

  const handleNameChange = useCallback(
    (event) => {
      const processedName = event.target.value
        .replace(/[^a-zA-Z0-9.\-_]/g, "-") // Replace characters other than ASCII letters, digits, ., -, and _ with -
        .replace(/-{2,}/g, "-"); // Replace consecutive dashes with a single dash
      setCreateRepositoryInput({
        ...createRepositoryInput,
        repoName: processedName,
      });
      const gitRepositoryUrl = getGitRepositoryDetails({
        organization: gitOrganization,
        repositoryName: processedName,
        groupName: createRepositoryInput.groupName,
      }).repositoryUrl;
      setGitRepositoryUrl(gitRepositoryUrl);
    },
    [setCreateRepositoryInput, createRepositoryInput, gitOrganization]
  );

  const handleCreation = useCallback(() => {
    onCreateGitRepository({
      gitOrganizationId: gitOrganization.id,
      gitOrganizationType: EnumGitOrganizationType.Organization,
      gitProvider: gitOrganization?.provider,
      name: createRepositoryInput.repoName,
      groupName: createRepositoryInput.groupName,
      isPublic: createRepositoryInput.isPublic,
      gitRepositoryUrl: gitRepositoryUrl,
    });
  }, [
    onCreateGitRepository,
    createRepositoryInput.repoName,
    createRepositoryInput.groupName,
    createRepositoryInput.isPublic,
    gitOrganization,
    gitRepositoryUrl,
  ]);

  return (
    <div className={`${CLASS_NAME}`}>
      <div className={`${CLASS_NAME}__header`}>
        <h4>
          Create a new {gitOrganization?.provider} repository to sync your
          resource with
        </h4>
      </div>
      {gitOrganization.useGroupingForRepositories && (
        <>
          <GitSelectGroup
            gitProvider={gitOrganization?.provider}
            selectedItem={repositoryGroup}
            items={gitGroups}
            onSelect={handleSelectGroup}
            loadingGroups={loadingGroups}
          />
        </>
      )}
      <br />
      <div>
        <Toggle
          name="isPublic"
          label="Public Repo"
          checked={createRepositoryInput.isPublic}
          onChange={(event, checked) => {
            setCreateRepositoryInput({
              ...createRepositoryInput,
              isPublic: checked,
            });
          }}
        />
      </div>
      <br />
      <div className={`${CLASS_NAME}__label`}>
        <Label text="Repository name" />
      </div>
      <TextInput
        autoFocus
        name="repoName"
        autoComplete="off"
        onChange={handleNameChange}
      />

      {!!createRepositoryInput.repoName && (
        <FlexItem
          direction={EnumFlexDirection.Column}
          gap={EnumGapSize.Default}
        >
          <Text
            textStyle={EnumTextStyle.Subtle}
            textColor={EnumTextColor.ThemeGreen}
          >
            {GIT_REPO_CREATION_MESSAGE}
            {createRepositoryInput.repoName}.
          </Text>

          <Text textStyle={EnumTextStyle.Label}>{GIT_REPO_NAME_RULES}</Text>
        </FlexItem>
      )}

      <HorizontalRule />

      <Button
        type="button"
        className={`${CLASS_NAME}__button`}
        disabled={repoCreated.isRepoCreateLoading}
        onClick={handleCreation}
      >
        {repoCreated.isRepoCreateLoading ? (
          <CircularProgress
            className={`${CLASS_NAME}__progress`}
            centerToParent
          />
        ) : (
          "Create new repository"
        )}
      </Button>
      <Label
        text={formatError(repoCreated.RepoCreatedError) || ""}
        type="error"
      />
    </div>
  );
}
