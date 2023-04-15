
import React from "react";

import { Center, Grid, ActionIcon } from "@mantine/core";
import { AiFillInstagram, AiFillGithub, AiFillLinkedin, AiFillFileText} from "react-icons/ai";

export default function SocialMediaButtons(){

    return (
        <Center h={1600}>
            <Grid justify="center" align="center" grow>
                <Grid.Col >
                    <a href="https://www.instagram.com/stevenlikessandwiches/" target="_blank" rel="external noreferrer">
                        <ActionIcon size="xl" color="dark">
                            <AiFillInstagram size={100} />
                        </ActionIcon>
                    </a>
                </Grid.Col>
            
            </Grid>
        </Center>
    );
};

