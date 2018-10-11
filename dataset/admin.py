from django.contrib import admin

from .models import Dataset, Datapoint, Label, UserLabel


class DatasetAdmin(admin.ModelAdmin):
    pass

class DatapointAdmin(admin.ModelAdmin):
    pass

class LabelAdmin(admin.ModelAdmin):
    pass

class UserLabelAdmin(admin.ModelAdmin):
    pass


admin.site.register(Dataset, DatasetAdmin)
admin.site.register(Datapoint, DatapointAdmin)
admin.site.register(Label, LabelAdmin)
admin.site.register(UserLabel, UserLabelAdmin)
