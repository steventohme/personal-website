
import React from "react";

import { Center, Grid, ActionIcon } from "@mantine/core";
import { AiFillInstagram, AiFillGithub, AiFillLinkedin, AiFillFileText} from "react-icons/ai";

export default function SocialMediaButtons(){

    return (
        <Center h={1600}>
            <Grid justify="center" align="center" grow>
                <Grid.Col span={1}>
                    <a href="https://www.instagram.com/stevenlikessandwiches/" target="_blank" rel="external noreferrer">
                        <ActionIcon size="xl" color="dark">
                            <AiFillInstagram size={100} />
                        </ActionIcon>
                    </a>
                </Grid.Col>
            
                <Grid.Col span={1}>
                    <a href="https://linkedin.com/in/steven-tohme" target="_blank" rel="external noreferrer">
                        <ActionIcon size="xl" color="dark">
                            <AiFillLinkedin size={100} />
                        </ActionIcon>
                    </a>
                </Grid.Col>
            
            </Grid>
        </Center>
    );
};

