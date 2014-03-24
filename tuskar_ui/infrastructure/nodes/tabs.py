# Copyright 2012 Nebula, Inc.
#
#    Licensed under the Apache License, Version 2.0 (the "License"); you may
#    not use this file except in compliance with the License. You may obtain
#    a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
#    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
#    License for the specific language governing permissions and limitations
#    under the License.

from django.core import urlresolvers
from django.utils.translation import ugettext_lazy as _

from horizon import tabs

from tuskar_ui import api
from tuskar_ui.infrastructure.nodes import tables


class OverviewTab(tabs.Tab):
    name = _("Overview")
    slug = "overview"
    template_name = ("infrastructure/nodes/_overview.html")

    def get_context_data(self, request):
        free_nodes = api.Node.list(request, associated=False)
        deployed_nodes = api.Node.list(request, associated=True)

        free_nodes_down = [node for node in free_nodes
                           if node.power_state != 'on']
        deployed_nodes_down = [node for node in deployed_nodes
                               if node.power_state != 'on']

        total_nodes = deployed_nodes + free_nodes
        total_nodes_down = deployed_nodes_down + free_nodes_down
        total_nodes_up = list(set(total_nodes) - set(total_nodes_down))

        return {
            'total_nodes': total_nodes,
            'total_nodes_down': total_nodes_down,
            'total_nodes_up': total_nodes_up,
            'deployed_nodes': deployed_nodes,
            'deployed_nodes_down': deployed_nodes_down,
            'free_nodes': free_nodes,
            'free_nodes_down': free_nodes_down,
        }


class DeployedTab(tabs.TableTab):
    table_classes = (tables.DeployedNodesTable,)
    name = _("Deployed")
    slug = "deployed"
    template_name = ("horizon/common/_detail_table.html")

    def get_items_count(self):
        deployed_nodes_count = len(api.Node.list(self.request,
                                                 associated=True))
        return deployed_nodes_count

    def get_deployed_nodes_data(self):
        redirect = urlresolvers.reverse('horizon:infrastructure:nodes:index')
        deployed_nodes = api.Node.list(self.request, associated=True,
                                       _error_redirect=redirect)
        return deployed_nodes


class FreeTab(tabs.TableTab):
    table_classes = (tables.FreeNodesTable,)
    name = _("Free")
    slug = "free"
    template_name = ("horizon/common/_detail_table.html")

    def get_items_count(self):
        free_nodes_count = len(api.Node.list(self.request,
                                             associated=False))
        return free_nodes_count

    def get_free_nodes_data(self):
        redirect = urlresolvers.reverse('horizon:infrastructure:nodes:index')
        free_nodes = api.Node.list(self.request, associated=False,
                                   _error_redirect=redirect)
        return free_nodes


class NodeTabs(tabs.TabGroup):
    slug = "nodes"
    tabs = (OverviewTab, DeployedTab, FreeTab)
    sticky = True
    template_name = "horizon/common/_items_count_tab_group.html"
